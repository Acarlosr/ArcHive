const balances = [
  { chain: "Arc Testnet", amount: "3,820.42", state: "Spend-ready" },
  { chain: "Base Sepolia", amount: "940.00", state: "Depositable" },
  { chain: "Ethereum Sepolia", amount: "510.18", state: "Depositable" },
];

export function UnifiedBalanceCard() {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/85 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-display font-semibold text-arc-text">Unified Balance</div>
          <p className="mt-1 text-xs text-arc-muted">Cross-chain USDC deposits become spendable escrow budget on Arc.</p>
        </div>
        <span className="rounded-full border border-arc-green/25 bg-arc-green/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
          Demo
        </span>
      </div>
      <div className="mb-4">
        <div className="text-3xl font-display font-bold text-arc-text">$5,270.60</div>
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">Aggregate USDC balance</div>
      </div>
      <div className="space-y-2">
        {balances.map((item) => (
          <div key={item.chain} className="flex items-center justify-between rounded-md border border-arc-border bg-arc-surface/70 px-3 py-2">
            <span className="text-sm text-arc-muted">{item.chain}</span>
            <span className="text-right">
              <span className="block font-mono text-sm text-arc-text">{item.amount}</span>
              <span className="block text-[10px] text-arc-dim">{item.state}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
