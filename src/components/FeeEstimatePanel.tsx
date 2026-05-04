export function FeeEstimatePanel({ amount = "0.00" }: { amount?: string }) {
  const numeric = Number(amount || 0);
  const protocolFee = numeric * 0.0025;
  const settlementFee = numeric > 0 ? 0.08 : 0;
  const total = numeric + protocolFee + settlementFee;

  return (
    <div className="rounded-lg border border-arc-border bg-arc-surface/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-display font-semibold text-arc-text">Fee estimate</div>
          <p className="text-xs text-arc-muted">Unified Balance spend preview for Arc Testnet.</p>
        </div>
        <span className="rounded-full border border-arc-cyan/25 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
          USDC
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-arc-muted">
          <span>Escrow amount</span>
          <span className="font-mono text-arc-text">{numeric.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-arc-muted">
          <span>Arc gateway fee</span>
          <span className="font-mono text-arc-text">{settlementFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-arc-muted">
          <span>Marketplace fee</span>
          <span className="font-mono text-arc-text">{protocolFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-arc-border pt-2 flex justify-between text-arc-text">
          <span>Total funding need</span>
          <span className="font-mono text-arc-green">{total.toFixed(2)} USDC</span>
        </div>
      </div>
    </div>
  );
}
