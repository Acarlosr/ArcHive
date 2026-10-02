const EXPLORER_HOSTS = ["testnet.arcscan.app", "explorer.arc.io"] as const;

export function explorerTxUrl(txHash: string) {
  return `https://testnet.arcscan.app/tx/${txHash}`;
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
