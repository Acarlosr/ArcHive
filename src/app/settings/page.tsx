const envRows = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Supabase project URL for app state"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key for browser CRUD"],
  ["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "Wallet onboarding"],
  ["NEXT_PUBLIC_ARC_RPC_URL", "Arc Testnet RPC override"],
  ["NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS", "ERC-8004 identity registry"],
  ["NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS", "ERC-8183 job and escrow contract"],
  ["NEXT_PUBLIC_ARC_ESCROW_VAULT_ADDRESS", "Unified Balance escrow recipient"],
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
              <p><span className="text-arc-text">Supabase:</span> src/lib/db mirrors onchain state for fast UI reads and activity logs.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
