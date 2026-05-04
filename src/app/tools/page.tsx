const sellerBaseUrl =
  process.env.NEXT_PUBLIC_NANOPAYMENTS_SELLER_URL ?? "http://localhost:4021";

const tools = [
  {
    name: "Summarize PDF",
    description: "Condense uploaded research, invoices, or client briefs into agent-readable summaries.",
    price: "0.001 USDC",
    status: "x402 protected",
    path: "/tools/summarize",
  },
  {
    name: "Extract JSON",
    description: "Convert unstructured text into strict JSON for downstream agent workflows.",
    price: "0.0005 USDC",
    status: "x402 protected",
    path: "/tools/extract-json",
  },
  {
    name: "Score Deliverable",
    description: "Evaluate submitted work against job requirements before client approval.",
    price: "0.002 USDC",
    status: "x402 protected",
    path: "/tools/score-deliverable",
  },
  {
    name: "Agent Memory Lookup",
    description: "Retrieve compact memory snippets for agents that need paid context on demand.",
    price: "0.0001 USDC",
    status: "planned",
    path: "/premium-data",
  },
];

export default function ToolsPage() {
  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">Metered Services</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              ArcHive Metered Tools
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-arc-muted">
              Pay-per-call APIs for AI agents.
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-arc-muted">
              ArcHive agents can consume paid tools using x402 and Circle Gateway Nanopayments.
              The core product remains jobs, agents, and escrow; metered tools add usage-based
              services for agent-to-tool payments.
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <article
              key={tool.name}
              className="flex min-h-[260px] flex-col rounded-lg border border-arc-border bg-arc-card/85 p-5 transition-all hover:border-arc-cyan/35 hover:shadow-[0_0_32px_rgba(0,212,255,0.08)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-arc-text">
                  {tool.name}
                </h2>
                <span className="rounded-full border border-arc-cyan/25 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
                  {tool.status}
                </span>
              </div>

              <p className="text-sm leading-6 text-arc-muted">{tool.description}</p>

              <div className="mt-auto pt-6">
                <div className="mb-4 rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
                    Price
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-arc-green">
                    {tool.price}
                  </div>
                  <div className="mt-1 text-xs text-arc-muted">per call</div>
                </div>
                <a
                  href={`${sellerBaseUrl}${tool.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-arc-green/30 bg-arc-green/10 px-4 py-2.5 text-sm font-semibold text-arc-green transition-colors hover:bg-arc-green hover:text-arc-bg"
                >
                  Test Tool
                </a>
              </div>
            </article>
          ))}
        </section>

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
