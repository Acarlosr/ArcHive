import { ARC_CHAIN } from "@/lib/arc/network";

// Explorer hosts we will link to (active network + legacy hosts from older
// deployments, so historical tx hashes keep resolving).
const EXPLORER_HOSTS = [
  "testnet.arcscan.app",
  "explorer.testnet.arc.io",
  "explorer.arc.io",
] as const;

export function explorerTxUrl(txHash: string) {
  return `${ARC_CHAIN.explorerUrl}/tx/${txHash}`;
}

export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.port && parsed.port !== "443") return null;
  if (parsed.username || parsed.password) return null;
  return (EXPLORER_HOSTS as readonly string[]).includes(parsed.hostname) ? parsed.toString() : null;
}
