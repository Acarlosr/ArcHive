const arcNetwork = [
  ["Network", "Arc Testnet"],
  ["Chain ID", "5042002"],
  ["Currency", "USDC"],
  ["RPC", "https://rpc.testnet.arc.network"],
  ["Explorer", "https://testnet.arcscan.app"],
];

export function TestnetFundsCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/5 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-lg font-semibold text-arc-text">Get Testnet Funds</div>
          <p className="mt-1 text-sm leading-6 text-arc-muted">
            Arc uses USDC for gas and escrow. USDC is live for job payments; EURC is available for testnet transfers and future flows.
          </p>
        </div>
        <span className="rounded-full border border-arc-cyan/30 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
          Faucet
        </span>
      </div>

      {!compact && (
        <div className="mb-4 grid gap-2 text-xs sm:grid-cols-2">
          {arcNetwork.map(([label, value]) => (
            <div key={label} className="rounded-md border border-arc-border bg-arc-bg/60 p-3">
              <div className="font-mono uppercase tracking-[0.12em] text-arc-dim">{label}</div>
              <div className="mt-1 break-all text-arc-text">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noreferrer"
          className="btn-primary flex-1 text-center"
        >
          Get USDC / EURC
        </a>
        <a
          href="https://docs.arc.network/arc/references/connect-to-arc"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary flex-1 text-center"
        >
          Add Arc Testnet
        </a>
      </div>
    </div>
  );
}
