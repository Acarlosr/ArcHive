"use client";

import { useLanguage } from "@/lib/i18n";

const balances = [
  { chain: "Arc Testnet", amount: "3,820.42", stateEn: "Spend-ready", statePt: "Pronto para gastar" },
  { chain: "Base Sepolia", amount: "940.00", stateEn: "Depositable", statePt: "Depositável" },
  { chain: "Ethereum Sepolia", amount: "510.18", stateEn: "Depositable", statePt: "Depositável" },
];

export function UnifiedBalanceCard() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";

  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/85 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-display font-semibold text-arc-text">Unified Balance</div>
          <p className="mt-1 text-xs text-arc-muted">
            {isPt ? "Depósitos cross-chain em USDC viram orçamento de escrow gastável na Arc." : "Cross-chain USDC deposits become spendable escrow budget on Arc."}
          </p>
        </div>
        <span className="rounded-full border border-arc-green/25 bg-arc-green/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
          Demo
        </span>
      </div>
      <div className="mb-4">
        <div className="text-3xl font-display font-bold text-arc-text">$5,270.60</div>
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{isPt ? "Saldo USDC agregado" : "Aggregate USDC balance"}</div>
      </div>
      <div className="space-y-2">
        {balances.map((item) => (
          <div key={item.chain} className="flex items-center justify-between rounded-md border border-arc-border bg-arc-surface/70 px-3 py-2">
            <span className="text-sm text-arc-muted">{item.chain}</span>
            <span className="text-right">
              <span className="block font-mono text-sm text-arc-text">{item.amount}</span>
              <span className="block text-[10px] text-arc-dim">{isPt ? item.statePt : item.stateEn}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
