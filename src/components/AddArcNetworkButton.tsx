"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { ARC_CHAIN, ARC_CHAIN_ID, ARC_CHAIN_LABEL } from "@/lib/arc/network";
import { ARC_RPC_URLS } from "@/lib/arc/rpc";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type Status = "idle" | "adding" | "added" | "failed" | "no-wallet";

// "Add Arc" button: asks the injected wallet (MetaMask etc.) to add the network
// through wallet_addEthereumChain. When there is no wallet, or the request fails
// or is rejected, an inline panel shows the network data with copy buttons so
// the user can add it by hand.
export function AddArcNetworkButton({ className = "", wrapperClassName = "" }: { className?: string; wrapperClassName?: string }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState<string | null>(null);

  const rpcUrl = ARC_RPC_URLS[0];
  const rows: Array<[string, string]> = [
    [isPt ? "Nome da rede" : "Network name", ARC_CHAIN_LABEL],
    ["RPC URL", rpcUrl],
    ["Chain ID", String(ARC_CHAIN_ID)],
    [isPt ? "Símbolo da moeda" : "Currency symbol", "USDC"],
    [isPt ? "Explorador de blocos" : "Block explorer", ARC_CHAIN.explorerUrl],
  ];

  async function addNetwork() {
    setOpen(true);
    const provider = (typeof window !== "undefined"
      ? (window as unknown as { ethereum?: Eip1193Provider }).ethereum
      : undefined);
    if (!provider) {
      setStatus("no-wallet");
      return;
    }
    setStatus("adding");
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
            chainName: ARC_CHAIN_LABEL,
            nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: [ARC_CHAIN.explorerUrl],
          },
        ],
      });
      setStatus("added");
    } catch {
      setStatus("failed");
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((current) => (current === value ? null : current)), 1500);
    } catch {
      // clipboard blocked: the value is still visible for manual copy
    }
  }

  const message: Record<Status, string> = {
    idle: "",
    adding: isPt ? "Confirme na sua carteira…" : "Confirm in your wallet…",
    added: isPt ? "Rede adicionada à carteira." : "Network added to your wallet.",
    failed: isPt
      ? "Não foi possível adicionar automaticamente. Copie os dados abaixo."
      : "Could not add it automatically. Copy the data below.",
    "no-wallet": isPt
      ? "Nenhuma carteira detectada. Copie os dados abaixo e adicione manualmente."
      : "No wallet detected. Copy the data below and add it manually.",
  };

  return (
    <span className={`relative inline-block ${wrapperClassName}`}>
      <button type="button" onClick={addNetwork} className={className}>
        {isPt ? `Adicionar ${ARC_CHAIN_LABEL}` : `Add ${ARC_CHAIN_LABEL}`}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={isPt ? "Dados da rede" : "Network details"}
          className="absolute left-0 top-full z-30 mt-2 w-[min(92vw,340px)] rounded-lg border border-arc-border bg-arc-card p-4 text-left shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-arc-text">
              {isPt ? `Rede ${ARC_CHAIN_LABEL}` : `${ARC_CHAIN_LABEL} network`}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-arc-muted transition-colors hover:text-white"
              aria-label={isPt ? "Fechar" : "Close"}
            >
              ✕
            </button>
          </div>

          {message[status] && (
            <p className={`mb-3 text-xs leading-5 ${status === "added" ? "text-arc-green" : "text-arc-muted"}`}>
              {message[status]}
            </p>
          )}

          <div className="space-y-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-md border border-arc-border bg-arc-bg/60 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-arc-dim">{label}</span>
                  <button
                    type="button"
                    onClick={() => copy(value)}
                    className="text-[11px] font-medium text-arc-cyan transition-colors hover:text-white"
                  >
                    {copied === value ? (isPt ? "Copiado" : "Copied") : isPt ? "Copiar" : "Copy"}
                  </button>
                </div>
                <div className="mt-1 break-all text-xs text-arc-text">{value}</div>
              </div>
            ))}
          </div>

          {(status === "failed" || status === "no-wallet") && (
            <button
              type="button"
              onClick={addNetwork}
              className="mt-3 text-xs font-medium text-arc-muted transition-colors hover:text-white"
            >
              {isPt ? "Tentar de novo" : "Try again"}
            </button>
          )}
        </div>
      )}
    </span>
  );
}
