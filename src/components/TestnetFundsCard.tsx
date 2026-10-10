"use client";

import { useLanguage } from "@/lib/i18n";
import { ARC_RPC_URLS } from "@/lib/arc/rpc";
import { ARC_CHAIN, ARC_CHAIN_ID, ARC_CHAIN_LABEL } from "@/lib/arc/network";

export function TestnetFundsCard({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const isMainnet = ARC_CHAIN.testnet === false;
  const arcNetwork = [
    [isPt ? "Rede" : "Network", ARC_CHAIN_LABEL],
    ["Chain ID", String(ARC_CHAIN_ID)],
    [isPt ? "Moeda" : "Currency", "USDC"],
    ["RPC", ARC_RPC_URLS[0]],
    [isPt ? "Explorador" : "Explorer", ARC_CHAIN.explorerUrl],
  ];

  return (
    <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/5 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-lg font-semibold text-arc-text">
            {isMainnet
              ? isPt
                ? "Obter USDC"
                : "Get USDC"
              : isPt
                ? "Obter fundos de teste"
                : "Get Testnet Funds"}
          </div>
          <p className="mt-1 text-sm leading-6 text-arc-muted">
            {isMainnet
              ? isPt
                ? "Na mainnet não existe faucet: financie sua carteira comprando USDC via on-ramp (ex.: Circle, Coinbase, MoonPay) e transferindo para Arc via Circle Gateway/CCTP, ou usando o Onramp Kit."
                : "There is no faucet on mainnet: fund your wallet by buying USDC through an on-ramp (e.g. Circle, Coinbase, MoonPay) and moving it to Arc via Circle Gateway/CCTP, or use the Onramp Kit."
              : isPt
                ? "Arc usa USDC para gas e escrow. USDC está ativo para pagamentos de jobs; EURC fica disponível para transferências de teste e fluxos futuros."
                : "Arc uses USDC for gas and escrow. USDC is live for job payments; EURC is available for testnet transfers and future flows."}
          </p>
        </div>
        <span className="rounded-full border border-arc-cyan/30 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
          {isMainnet ? "On-ramp" : "Faucet"}
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
        {isMainnet ? (
          <>
            <a
              href="https://www.arc.io"
              target="_blank"
              rel="noreferrer"
              className="btn-primary flex-1 text-center"
            >
              {isPt ? "Como obter USDC em Arc" : "How to get USDC on Arc"}
            </a>
            <a
              href="https://docs.arc.io/app-kit/onramp"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary flex-1 text-center"
            >
              {isPt ? "Onramp Kit" : "Onramp Kit"}
            </a>
          </>
        ) : (
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex-1 text-center"
          >
            {isPt ? "Pegar USDC / EURC" : "Get USDC / EURC"}
          </a>
        )}
        <a
          href="https://docs.arc.io/arc/references/connect-to-arc"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary flex-1 text-center"
        >
          {isPt ? `Adicionar ${ARC_CHAIN_LABEL}` : `Add ${ARC_CHAIN_LABEL}`}
        </a>
      </div>
    </div>
  );
}
