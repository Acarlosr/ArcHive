"use client";

import { explorerTxUrl } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

export function ExplorerLink({ txHash, label = "View tx" }: { txHash?: string | null; label?: string }) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";

  if (!txHash) {
    return <span className="font-mono text-xs text-arc-dim">{isPt ? "Pendente" : "Pending"}</span>;
  }

  return (
    <a
      href={explorerTxUrl(txHash)}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-arc-cyan transition-colors hover:text-white"
    >
      {label === "View tx" ? (isPt ? "Ver tx" : label) : label}: {txHash.slice(0, 10)}...{txHash.slice(-6)}
    </a>
  );
}
