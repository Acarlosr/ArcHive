import { AgentSpendConsole } from "@/components/AgentSpendConsole";
import { MeteredToolTester } from "@/components/MeteredToolTester";
import { agentPaidTools } from "@/lib/agentSpend";

const sellerBaseUrl =
  process.env.NEXT_PUBLIC_NANOPAYMENTS_SELLER_URL ?? "http://localhost:4021";

const toolPayloads: Record<string, Record<string, unknown>> = {
  "summarize-pdf": {
    text: "ArcHive agent reviewed a funded escrow job and needs a concise client-ready brief.",
  },
  "extract-json": {
    title: "Extract ArcHive job metadata",
    entities: ["agent", "escrow", "deliverable", "tool_spend"],
  },
  "score-deliverable": {
    requirements: "Verify the submitted work proof, summarize the output, and confirm job criteria.",
    deliverable: "ipfs://bafybeihive-deliverable with completed research and structured findings.",
  },
};

const tools = agentPaidTools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  price: `${tool.priceUsdc} USDC`,
  status: "x402 protected",
  method: tool.method,
  path: tool.endpoint,
  body: tool.method === "POST" ? toolPayloads[tool.id] : undefined,
}));

export default function ToolsPage() {
  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">Agent Spend Router</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              Controlled USDC spend for AI agents
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-arc-muted">
              Pay-per-call services tied to funded jobs, explicit policy caps, and receipt trails.
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-arc-muted">
              The job remains the center of the product. Agents can use x402 tools through Circle
              Gateway Nanopayments, but each spend is bounded by the job policy and logged as part
              of the work record.
            </p>
          </div>

          <div className="rounded-lg border border-arc-green/20 bg-arc-green/5 p-5">
            <div className="text-sm font-display font-semibold text-arc-text">
              Seller service
            </div>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              Protected routes live in <span className="font-mono text-arc-green">services/nanopayments-seller</span>.
              Buyer-side nanopayments require EOA wallets and a funded Gateway balance.
            </p>
            <div className="mt-4 rounded-md border border-arc-border bg-arc-bg/70 p-3 font-mono text-xs text-arc-dim">
              {sellerBaseUrl}
            </div>
          </div>
        </section>

        <AgentSpendConsole />

        <div className="mb-5 mt-10">
          <div className="label-field mb-2">Protected endpoints</div>
          <h2 className="font-display text-2xl font-bold text-arc-text">x402 seller routes</h2>
        </div>

        <MeteredToolTester sellerBaseUrl={sellerBaseUrl} tools={tools} />

        <section className="mt-8 rounded-lg border border-arc-border bg-arc-card/80 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="label-field mb-2">Protocol</div>
              <p className="text-sm leading-6 text-arc-muted">
                x402 returns HTTP 402 payment requirements for unpaid requests and serves the
                resource after a valid payment signature.
              </p>
            </div>
            <div>
              <div className="label-field mb-2">Settlement</div>
              <p className="text-sm leading-6 text-arc-muted">
                Circle Gateway batches signed authorizations, making sub-cent USDC calls practical
                for AI agents.
              </p>
            </div>
            <div>
              <div className="label-field mb-2">Network</div>
              <p className="text-sm leading-6 text-arc-muted">
                The seller service can restrict accepted payments to Arc Testnet with
                <span className="font-mono text-arc-cyan"> eip155:5042002</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
