import { explorerTxUrl } from "@/lib/demoData";

export function ExplorerLink({ txHash, label = "View tx" }: { txHash?: string | null; label?: string }) {
  if (!txHash) {
    return <span className="font-mono text-xs text-arc-dim">Pending</span>;
  }

  return (
    <a
      href={explorerTxUrl(txHash)}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-arc-cyan transition-colors hover:text-white"
    >
      {label}: {txHash.slice(0, 10)}...{txHash.slice(-6)}
    </a>
  );
}
