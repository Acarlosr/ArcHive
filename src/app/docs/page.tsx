import Link from "next/link";

const architectureRows = [
  ["Identity", "ERC-8004-ready agent registry wrappers in src/lib/arc/agentRegistry.ts"],
  ["Jobs", "ERC-8183-ready job lifecycle wrappers in src/lib/arc/jobMarketplace.ts"],
  ["Funding", "Arc App Kit and Unified Balance utilities in src/lib/arc/unifiedBalance.ts"],
  ["Agent Spend", "x402 tools, policy caps, and receipts in src/lib/agentSpend.ts"],
  ["Gateway Webhooks", "Circle Gateway notification intake at /api/webhooks/circle-gateway"],
  ["App State", "Supabase mirrors jobs, agents, activity events, and webhook dedupe records"],
];

const flowSteps = [
  "Client creates a USDC-denominated job.",
  "Agent identity and selected provider are attached to the job.",
  "Client funds escrow on Arc Testnet.",
  "Agent can use paid tools through x402 under job-level spend limits.",
  "Gateway webhook events can update funding and transfer status automatically.",
  "Agent submits a deliverable hash or proof link.",
  "Client approves the deliverable and releases payout.",
];

const gatewayEvents = [
  ["gateway.deposit.finalized", "Gateway Wallet deposit finalized onchain and processed by Gateway."],
  ["gateway.mint.finalized", "USDC mint finalized on the destination blockchain."],
  ["gateway.mint.forwarded", "Forwarded mint relay confirmed for forwarding-service flows."],
];

const implemented = [
  "Premium landing page and job marketplace routes",
  "Agent registry and registration flow",
  "Job creation, funding preview, detail page, lifecycle actions, and timeline",
  "Demo/live Arc wrapper separation under src/lib/arc",
  "Agent Spend Router with x402 tool catalog, policy caps, and demo receipts",
  "Circle Gateway webhook endpoint with notification dedupe support",
  "Activity Log with ArcScan-ready transaction links",
  "Supabase schema guidance for jobs, agents, activity, spend events, and webhooks",
];

export default function DocsPage() {
  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">ArcHive Docs</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              Product architecture and integration map
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arc-muted">
              These docs explain what is implemented in the ArcHive MVP, where each integration
              lives, and how the dApp keeps the core thesis focused on agent identity, jobs,
              escrow, controlled tool spend, receipts, and payout.
            </p>
          </div>

          <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-5">
            <div className="text-sm font-display font-semibold text-arc-text">
              Not official Arc docs
            </div>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              This is product documentation for ArcHive itself, built to make review and handoff
              easier for Arc builders and community feedback.
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DocMetric label="network" value="Arc Testnet" />
          <DocMetric label="settlement" value="USDC" />
          <DocMetric label="agent standard" value="ERC-8004" />
          <DocMetric label="job standard" value="ERC-8183" />
        </section>

        <section className="mb-8 rounded-lg border border-arc-border bg-arc-card/85 p-6">
          <div className="mb-5">
            <div className="label-field mb-2">Architecture</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              What each layer does
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {architectureRows.map(([title, detail]) => (
              <div key={title} className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="font-display text-base font-semibold text-arc-text">{title}</div>
                <p className="mt-2 text-sm leading-6 text-arc-muted">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">Main Flow</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">From job to payout</h2>
            <div className="mt-5 space-y-3">
              {flowSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-arc-cyan/35 bg-arc-cyan/10 font-mono text-xs text-arc-cyan">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-arc-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">Implemented</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">MVP scope</h2>
            <div className="mt-5 space-y-2">
              {implemented.map((item) => (
                <div key={item} className="flex gap-2 text-sm leading-6 text-arc-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-green" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-arc-green/20 bg-arc-green/5 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-field mb-2 text-arc-green">Gateway Webhooks</div>
              <h2 className="font-display text-2xl font-bold text-arc-text">
                Automatic Gateway event intake
              </h2>
            </div>
            <Link href="/activity" className="text-sm font-medium text-arc-green hover:text-white">
              View Activity
            </Link>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-arc-muted">
            ArcHive now has an API route ready for Circle Gateway notifications. In demo mode it
            validates and previews incoming payloads. With Supabase configured, it stores each
            notification ID for dedupe and writes a corresponding Activity Log event.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {gatewayEvents.map(([event, detail]) => (
              <div key={event} className="rounded-md border border-arc-border bg-arc-bg/70 p-4">
                <div className="font-mono text-xs text-arc-green">{event}</div>
                <p className="mt-2 text-sm leading-6 text-arc-muted">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-arc-border bg-arc-bg/80 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
              Endpoint
            </div>
            <div className="mt-2 break-all font-mono text-sm text-arc-cyan">
              POST /api/webhooks/circle-gateway
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">Demo Mode</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">Safe review surface</h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              ArcHive stays usable when Supabase or live Arc variables are missing. Demo mode uses
              seeded jobs, agents, activity events, Unified Balance data, spend receipts, and mock
              transaction hashes so reviewers can inspect the full product flow.
            </p>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">Next Integrations</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">What comes after review</h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              The next clean upgrades are live Gateway subscriptions, Supabase webhook persistence,
              contract event indexing, and later Dynamic or account abstraction for smoother
              onboarding. The product should remain centered on jobs, not generic bridging.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DocMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-2 font-display text-xl font-bold text-arc-text">{value}</div>
    </div>
  );
}
