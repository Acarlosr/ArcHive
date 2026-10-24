// src/lib/walletAuthMessage.ts
// Shared between client (signing) and server (verifying).
// The message binds an action, a wallet, a timestamp and (for per-record
// actions) the id of the record, so a signed header cannot be reused after the
// window expires nor against a different job/agent/link.

export const AUTH_HEADERS = {
  address: "x-arc-auth-address",
  message: "x-arc-auth-message",
  signature: "x-arc-auth-signature",
} as const;

export const AUTH_MAX_AGE_SECONDS = 5 * 60;

export type WalletAuthAction = "create_job" | "update_job" | "create_agent" | "update_agent" | "create_link" | "pay_link" | "log_event";

// NOTE: the message travels in an HTTP header (latin-1 only, no newlines),
// so it is base64-encoded on the wire and decoded before verification.
export function buildWalletAuthMessage(
  action: WalletAuthAction,
  address: string,
  timestamp: string,
  resource?: string,
): string {
  const lines = [
    "ArcHive - authorize action",
    `Action: ${action}`,
    `Wallet: ${address.toLowerCase()}`,
  ];
  if (resource) lines.push(`Resource: ${resource}`);
  lines.push(`Timestamp: ${timestamp}`);
  return lines.join("\n");
}

export function encodeWalletAuthMessage(message: string): string {
  return Buffer.from(message, "utf-8").toString("base64");
}

export function decodeWalletAuthMessage(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}
