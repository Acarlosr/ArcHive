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
const FACILITATOR_URL =
  process.env.FACILITATOR_URL ??
  (ACCEPT_ARC_ONLY ? "https://gateway-api-testnet.circle.com" : undefined);

if (!SELLER_ADDRESS || SELLER_ADDRESS === "0x0000000000000000000000000000000000000000") {
  throw new Error("SELLER_ADDRESS must be set to the EOA wallet address that receives USDC.");
}

const app = express();
app.use(express.json({ limit: "2mb" }));

const gateway = createGatewayMiddleware({
  sellerAddress: SELLER_ADDRESS,
  description: "ArcHive Metered Tools: x402 + Circle Gateway Nanopayments",
  ...(FACILITATOR_URL ? { facilitatorUrl: FACILITATOR_URL } : {}),
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
    service: "ArcHive Metered Tools seller",
    status: "ok",
    acceptArcOnly: ACCEPT_ARC_ONLY,
    facilitatorUrl: FACILITATOR_URL ?? "https://gateway-api.circle.com",
    networks: ACCEPT_ARC_ONLY ? [ARC_TESTNET_NETWORK] : "gateway-supported",
  });
});

app.get("/premium-data", paid("$0.001"), (req: Request, res: Response) => {
  res.json({
    tool: "premium-data",
    data: {
      activeEscrowSignals: ["funding_intent", "deliverable_hash", "approval_ready"],
      suggestedAgentAction: "score deliverable before payout release",
    },
    payment: paymentMeta(req),
  });
});

app.post("/tools/summarize", paid("$0.001"), (req: Request, res: Response) => {
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

app.post("/tools/extract-json", paid("$0.0005"), (req: Request, res: Response) => {
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

app.post("/tools/score-deliverable", paid("$0.002"), (req: Request, res: Response) => {
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
  console.log(`ArcHive Metered Tools seller listening at http://localhost:${PORT}`);
  console.log(
    ACCEPT_ARC_ONLY
      ? `Accepting Circle Gateway x402 payments only on ${ARC_TESTNET_NETWORK}`
      : "Accepting Circle Gateway x402 payments on all Gateway-supported networks",
  );
  console.log(`Circle Gateway facilitator: ${FACILITATOR_URL ?? "https://gateway-api.circle.com"}`);
});
