// src/lib/clientWalletAuth.ts
// Client-side helper: builds the signed headers for API writes.
// The user's connected wallet signs a short action message; the server
// verifies it before touching the database.

import type { WalletClient } from "viem";
import { AUTH_HEADERS, buildWalletAuthMessage, encodeWalletAuthMessage, type WalletAuthAction } from "./walletAuthMessage";

export async function walletAuthHeaders(
  action: WalletAuthAction,
  walletClient: WalletClient | null
): Promise<Record<string, string>> {
  if (!walletClient) {
    throw new Error("Wallet not connected. Connect your wallet to continue.");
  }
  const account = walletClient.account;
  if (!account) throw new Error("No account selected.");
  const address = account.address;

  const timestamp = new Date().toISOString();
  const message = buildWalletAuthMessage(action, address, timestamp);
  const signature = await walletClient.signMessage({ message, account });

  return {
    [AUTH_HEADERS.address]: address,
    [AUTH_HEADERS.message]: encodeWalletAuthMessage(message),
    [AUTH_HEADERS.signature]: signature,
  };
}

export async function postToApi(
  url: string,
  body: unknown,
  headers: Record<string, string>
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
