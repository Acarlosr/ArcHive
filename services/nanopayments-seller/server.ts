import "dotenv/config";
import express, { type Request, type RequestHandler, type Response } from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";

declare global {
  namespace Express {
    interface Request {
      payment?: {
        verified: boolean;
        payer: string;
        amount: string;
        network: string;
        transaction?: string;
      };
    }
  }
}

const PORT = Number(process.env.PORT ?? 4021);
const SELLER_ADDRESS = process.env.SELLER_ADDRESS;
const ACCEPT_ARC_ONLY = process.env.ACCEPT_ARC_ONLY !== "false";
const ARC_TESTNET_NETWORK = "eip155:5042002";
const FACILITATOR_BY_NETWORK = {
  testnet: "https://gateway-api-testnet.circle.com",
  mainnet: "https://gateway-api.circle.com",
} as const;
const ARC_NETWORK = process.env.ARC_NETWORK;
const FACILITATOR_URL = process.env.FACILITATOR_URL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const MAX_PER_CALL_USD = Number(process.env.MAX_PER_CALL_USD ?? "0.01");
const MAX_TOTAL_PER_JOB_USD = Number(process.env.MAX_TOTAL_PER_JOB_USD ?? "25");
const JOB_CAP_FRACTION = Number(process.env.JOB_CAP_FRACTION ?? "0.03");
const TOOL_PRICES: Record<string, string> = {
  "GET /premium-data": "0.001",
  "POST /tools/summarize": "0.001",
  "POST /tools/extract-json": "0.0005",
  "POST /tools/score-deliverable": "0.002",
};

if (!SELLER_ADDRESS || SELLER_ADDRESS === "0x0000000000000000000000000000000000000000") {
  throw new Error("SELLER_ADDRESS must be set to the EOA wallet address that receives USDC.");
}
if (ARC_NETWORK !== "testnet" && ARC_NETWORK !== "mainnet") {
  throw new Error("ARC_NETWORK must be set to 'testnet' or 'mainnet' so the facilitator URL matches the deployed network.");
}
if (ALLOWED_ORIGINS.length === 0) {
  throw new Error("ALLOWED_ORIGIN must be set to the explicit app origin (comma-separated list allowed); wildcard CORS is not allowed.");
}
if (!Number.isFinite(MAX_PER_CALL_USD) || MAX_PER_CALL_USD <= 0) {
  throw new Error("MAX_PER_CALL_USD must be a positive number.");
}
if (!Number.isFinite(MAX_TOTAL_PER_JOB_USD) || MAX_TOTAL_PER_JOB_USD <= 0) {
  throw new Error("MAX_TOTAL_PER_JOB_USD must be a positive number.");
}
if (!Number.isFinite(JOB_CAP_FRACTION) || JOB_CAP_FRACTION < 0 || JOB_CAP_FRACTION > 1) {
  throw new Error("JOB_CAP_FRACTION must be a number between 0 and 1.");
}

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-PAYMENT, X-PAYMENT-RESPONSE",
  );
  res.setHeader("Access-Control-Expose-Headers", "X-PAYMENT-RESPONSE");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

interface JobLedgerEntry {
  capUsdc: number;
  spentUsdc: number;
}

const jobLedger = new Map<string, JobLedgerEntry>();

function jobCapUsdc(jobBudgetUsdc?: number) {
  if (Number.isFinite(jobBudgetUsdc) && (jobBudgetUsdc as number) > 0) {
    return Math.min(Math.max((jobBudgetUsdc as number) * JOB_CAP_FRACTION, 0.01), MAX_TOTAL_PER_JOB_USD);
  }
  return MAX_TOTAL_PER_JOB_USD;
}

function ledgerEntry(jobId: string, jobBudgetUsdc?: number) {
  let entry = jobLedger.get(jobId);
  if (!entry) {
    entry = { capUsdc: jobCapUsdc(jobBudgetUsdc), spentUsdc: 0 };
    jobLedger.set(jobId, entry);
    return entry;
  }
  entry.capUsdc = Math.min(entry.capUsdc, jobCapUsdc(jobBudgetUsdc));
  return entry;
}

function extractJobId(req: Request): string {
  const fromBody = (req.body as Record<string, unknown> | undefined)?.jobId;
  const fromQuery = req.query.jobId;
  return String(fromBody ?? fromQuery ?? "").trim();
}

function extractJobBudget(req: Request): number | undefined {
  const fromBody = (req.body as Record<string, unknown> | undefined)?.jobBudgetUsdc;
  const fromQuery = req.query.jobBudgetUsdc;
  const parsed = Number(fromBody ?? fromQuery);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function capGuard(priceUsdc: string): RequestHandler {
  return (req: Request, res: Response, next) => {
    const jobId = extractJobId(req);
    if (!jobId) {
      res.status(403).json({
        error: "jobId_required",
        message: "Paid calls must include a jobId so the seller can enforce the per-job spend cap.",
      });
      return;
    }
    const entry = ledgerEntry(jobId, extractJobBudget(req));
    const price = Number(priceUsdc);
    const remaining = entry.capUsdc - entry.spentUsdc;
    if (entry.spentUsdc + price > entry.capUsdc + 1e-9) {
      res.status(403).json({
        error: "spend_cap_exceeded",
        message: "This job has exhausted its approved spend budget. No further paid calls will be served.",
        jobId,
        limitUsdc: entry.capUsdc.toFixed(4),
        spentUsdc: entry.spentUsdc.toFixed(4),
        remainingUsdc: Math.max(remaining, 0).toFixed(4),
        requestedPriceUsdc: priceUsdc,
      });
      return;
    }
    next();
  };
}

function recordSpend(req: Request, priceUsdc: string) {
  const jobId = extractJobId(req);
  if (!jobId) return;
  const entry = ledgerEntry(jobId, extractJobBudget(req));
  const amount = Number(req.payment?.amount ?? priceUsdc);
  entry.spentUsdc += Number.isFinite(amount) ? amount : Number(priceUsdc);
}

const gateway = createGatewayMiddleware({
  sellerAddress: SELLER_ADDRESS!,
  description: "ArcHive Agent Spend Router: x402 + Circle Gateway Nanopayments",
  facilitatorUrl: FACILITATOR_URL ?? FACILITATOR_BY_NETWORK[ARC_NETWORK as keyof typeof FACILITATOR_BY_NETWORK],
  ...(ACCEPT_ARC_ONLY ? { networks: [ARC_TESTNET_NETWORK] } : {}),
});

const paid = (price: string): RequestHandler => gateway.require(price) as unknown as RequestHandler;

function paymentMeta(req: Request) {
  return {
    paid_by: req.payment?.payer,
    amount_usdc: req.payment?.amount,
    network: req.payment?.network,
  };
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    service: "ArcHive Agent Spend Router seller",
    status: "ok",
    acceptArcOnly: ACCEPT_ARC_ONLY,
    arcNetwork: ARC_NETWORK,
    facilitatorUrl: FACILITATOR_URL ?? FACILITATOR_BY_NETWORK[ARC_NETWORK as keyof typeof FACILITATOR_BY_NETWORK],
    networks: ACCEPT_ARC_ONLY ? [ARC_TESTNET_NETWORK] : "gateway-supported",
    caps: {
      maxPerCallUsdc: MAX_PER_CALL_USD,
      maxTotalPerJobUsdc: MAX_TOTAL_PER_JOB_USD,
      jobCapFraction: JOB_CAP_FRACTION,
      trackedJobs: jobLedger.size,
    },
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "ArcHive Agent Spend Router seller",
    status: "ok",
    docs: "Use POST endpoints from ArcHive agents or x402-capable clients. Browser GET requests show route metadata only. Paid calls require jobId and are capped per job.",
    endpoints: {
      "GET /health": "Seller service health",
      "GET /usage/:jobId": "Current spend ledger for a job",
      "GET /premium-data": "x402 protected demo endpoint",
      "POST /tools/summarize": "x402 protected PDF/text summarizer",
      "POST /tools/extract-json": "x402 protected structured JSON extractor",
      "POST /tools/score-deliverable": "x402 protected deliverable scoring",
    },
  });
});

app.get("/usage/:jobId", (req: Request, res: Response) => {
  const jobId = String(req.params.jobId ?? "").trim();
  const entry = jobLedger.get(jobId);
  const capUsdc = entry?.capUsdc ?? MAX_TOTAL_PER_JOB_USD;
  const spentUsdc = entry?.spentUsdc ?? 0;
  res.json({
    jobId,
    limitUsdc: capUsdc.toFixed(4),
    spentUsdc: spentUsdc.toFixed(4),
    remainingUsdc: Math.max(capUsdc - spentUsdc, 0).toFixed(4),
    toolPrices: TOOL_PRICES,
  });
});

app.get("/tools/summarize", (_req: Request, res: Response) => {
  res.status(405).json({
    error: "Method Not Allowed",
    message: "Summarize PDF is a paid API route. Use POST with an x402-capable client.",
    methodRequired: "POST",
    price: "0.001 USDC",
    network: ACCEPT_ARC_ONLY ? ARC_TESTNET_NETWORK : "gateway-supported",
  });
});

app.get("/tools/extract-json", (_req: Request, res: Response) => {
  res.status(405).json({
    error: "Method Not Allowed",
    message: "Extract JSON is a paid API route. Use POST with an x402-capable client.",
    methodRequired: "POST",
    price: "0.0005 USDC",
    network: ACCEPT_ARC_ONLY ? ARC_TESTNET_NETWORK : "gateway-supported",
  });
});

app.get("/tools/score-deliverable", (_req: Request, res: Response) => {
  res.status(405).json({
    error: "Method Not Allowed",
    message: "Score Deliverable is a paid API route. Use POST with an x402-capable client.",
    methodRequired: "POST",
    price: "0.002 USDC",
    network: ACCEPT_ARC_ONLY ? ARC_TESTNET_NETWORK : "gateway-supported",
  });
});

app.get("/premium-data", capGuard("0.001"), paid("$0.001"), (req: Request, res: Response) => {
  recordSpend(req, "0.001");
  res.json({
    tool: "premium-data",
    data: {
      activeEscrowSignals: ["funding_intent", "deliverable_hash", "approval_ready"],
      suggestedAgentAction: "score deliverable before payout release",
    },
    payment: paymentMeta(req),
  });
});

app.post("/tools/summarize", capGuard("0.001"), paid("$0.001"), (req: Request, res: Response) => {
  recordSpend(req, "0.001");
  const input = String(req.body?.text ?? req.body?.content ?? "");
  res.json({
    tool: "summarize-pdf",
    summary:
      input.length > 0
        ? `Summary preview: ${input.slice(0, 220)}${input.length > 220 ? "..." : ""}`
        : "No document content was supplied. Send text/content in the JSON body.",
    payment: paymentMeta(req),
  });
});

app.post("/tools/extract-json", capGuard("0.0005"), paid("$0.0005"), (req: Request, res: Response) => {
  recordSpend(req, "0.0005");
  res.json({
    tool: "extract-json",
    extracted: {
      title: req.body?.title ?? null,
      entities: Array.isArray(req.body?.entities) ? req.body.entities : [],
      sourceLength: JSON.stringify(req.body ?? {}).length,
    },
    payment: paymentMeta(req),
  });
});

app.post("/tools/score-deliverable", capGuard("0.002"), paid("$0.002"), (req: Request, res: Response) => {
  recordSpend(req, "0.002");
  const requirements = String(req.body?.requirements ?? "");
  const deliverable = String(req.body?.deliverable ?? "");
  const hasRequirements = requirements.length > 20;
  const hasDeliverable = deliverable.length > 20;

  res.json({
    tool: "score-deliverable",
    score: hasRequirements && hasDeliverable ? 86 : 54,
    verdict: hasRequirements && hasDeliverable ? "review-ready" : "needs-more-context",
    checks: {
      requirementsProvided: hasRequirements,
      deliverableProvided: hasDeliverable,
      escrowReleaseRecommended: hasRequirements && hasDeliverable,
    },
    payment: paymentMeta(req),
  });
});

app.listen(PORT, () => {
  console.log(`ArcHive Agent Spend Router seller listening at http://localhost:${PORT}`);
  console.log(
    ACCEPT_ARC_ONLY
      ? `Accepting Circle Gateway x402 payments only on ${ARC_TESTNET_NETWORK}`
      : "Accepting Circle Gateway x402 payments on all Gateway-supported networks",
  );
  console.log(`Circle Gateway facilitator: ${FACILITATOR_URL ?? FACILITATOR_BY_NETWORK[ARC_NETWORK as keyof typeof FACILITATOR_BY_NETWORK]}`);
  console.log(`Spend caps: ${MAX_PER_CALL_USD} per call, ${MAX_TOTAL_PER_JOB_USD} total per job (fraction ${JOB_CAP_FRACTION} of job budget when provided)`);
});
