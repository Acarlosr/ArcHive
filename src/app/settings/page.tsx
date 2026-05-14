const envRows = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Supabase project URL for app state"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key for browser CRUD"],
  ["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "Wallet onboarding"],
  ["NEXT_PUBLIC_ARC_RPC_URL", "Arc Testnet RPC override"],
  ["NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS", "ERC-8004 identity registry"],
  ["NEXT_PUBLIC_ARC_REPUTATION_REGISTRY_ADDRESS", "ERC-8004 reputation registry"],
  ["NEXT_PUBLIC_ARC_VALIDATION_REGISTRY_ADDRESS", "ERC-8004 validation registry"],
  ["NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS", "ERC-8183 job and escrow contract"],
  ["NEXT_PUBLIC_ARC_ESCROW_VAULT_ADDRESS", "Unified Balance escrow recipient"],
  ["NEXT_PUBLIC_ARC_USDC_ADDRESS", "Arc Testnet USDC token"],
  ["NEXT_PUBLIC_NANOPAYMENTS_SELLER_URL", "x402 seller base URL for agent tool calls"],
  ["NEXT_PUBLIC_ARC_MOCK_MODE", "Demo/live mode switch"],
];

const readinessRows = [
  ["Ready", "Arc Testnet network", "Chain ID 5042002, RPC, explorer, and USDC gas assumptions are configured."],
  ["Ready", "ERC-8004 identity", "IdentityRegistry, ReputationRegistry, and ValidationRegistry addresses are mapped from Arc docs."],
  ["Ready", "ERC-8183 core flow", "Job creation, provider budget setting, USDC approval/funding, submission, and completion are wired for live mode."],
  ["Ready", "x402 metered tools", "Circle Gateway seller service is isolated under services/nanopayments-seller."],
  ["Ready", "Agent spend policy", "Job-linked caps, selected tools, simulated receipts, and activity events are modeled in demo mode."],
  ["Next", "Event monitors", "Circle contract event webhooks or an indexer can sync live onchain events into Supabase."],
  ["Next", "Reject/refund live actions", "ERC-8183 reject() and claimRefund() should be wired before a broader public live beta."],
  ["Next", "Compliance/indexing", "Wallet screening, monitoring, and indexed activity are optional production hardening layers."],
];

export default function SettingsPage() {
  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="label-field mb-2">Settings</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">ArcHive integration map</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">
            Demo mode is automatic when secrets or contract addresses are missing. Live mode plugs into the isolated files under src/lib/arc.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-arc-text">Environment variables</h2>
            <div className="space-y-3">
              {envRows.map(([key, detail]) => (
                <div key={key} className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <div className="font-mono text-xs text-arc-cyan">{key}</div>
                  <div className="mt-1 text-sm text-arc-muted">{detail}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <h2 className="font-display text-xl font-semibold text-arc-text">Integration points</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-arc-muted">
              <p><span className="text-arc-text">ERC-8004:</span> src/lib/arc/agentRegistry.ts handles identity registration, lookup, reputation, and feedback.</p>
              <p><span className="text-arc-text">ERC-8183:</span> src/lib/arc/jobMarketplace.ts owns job creation, escrow funding, acceptance, submission, approval, payout, and refunds.</p>
              <p><span className="text-arc-text">Unified Balance:</span> src/lib/arc/unifiedBalance.ts powers cross-chain USDC deposits, fee estimation, and escrow spending.</p>
              <p><span className="text-arc-text">Agent Spend:</span> src/lib/agentSpend.ts defines tool policies, x402 services, and job-linked receipts.</p>
              <p><span className="text-arc-text">Supabase:</span> src/lib/db mirrors onchain state for fast UI reads and activity logs.</p>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-lg border border-arc-border bg-arc-card/85 p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-field">Arc Build / Integrate checklist</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-arc-text">Production readiness</h2>
            </div>
            <a
              href="https://docs.arc.network/build"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-arc-cyan hover:text-white"
            >
              Arc Build docs
            </a>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {readinessRows.map(([status, title, detail]) => (
              <div key={title} className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] ${status === "Ready" ? "border-arc-green/30 bg-arc-green/10 text-arc-green" : "border-arc-orange/30 bg-arc-orange/10 text-arc-orange"}`}>
                    {status}
                  </span>
                  <span className="font-medium text-arc-text">{title}</span>
                </div>
                <p className="text-sm leading-6 text-arc-muted">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
