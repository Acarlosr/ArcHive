// src/lib/serverWalletAuth.ts
// Server-side validation of wallet-signed request headers.
// Proves the caller owns the wallet it claims before any write reaches
// the database with the service role key.
//
// The signed message binds: action + wallet + timestamp (+ resource id for
// per-record actions). A signature is also single-use per server instance, so
// a captured header cannot be replayed inside the 5-minute window.
// NOTE: the single-use cache is in memory; it covers a warm instance. A shared
// store (e.g. Redis/Upstash) is the next step for multi-instance deployments.

import { recoverMessageAddress } from "viem";
import {
  AUTH_HEADERS,
  AUTH_MAX_AGE_SECONDS,
  buildWalletAuthMessage,
  decodeWalletAuthMessage,
  type WalletAuthAction,
} from "./walletAuthMessage";
import { checkRateLimit, clientIpFromRequest } from "./rateLimit";

export interface WalletAuth {
  address: string;
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const SIGNATURE_RE = /^0x[0-9a-fA-F]{130}$/;

const usedSignatures = new Map<string, number>(); // signature -> expiry (ms)

function consumeSignature(signature: string): boolean {
  const now = Date.now();
  if (usedSignatures.size > 5_000) {
    for (const [sig, expiresAt] of usedSignatures) {
      if (expiresAt <= now) usedSignatures.delete(sig);
    }
  }
  const key = signature.toLowerCase();
  const existing = usedSignatures.get(key);
  if (existing && existing > now) return false;
  usedSignatures.set(key, now + (AUTH_MAX_AGE_SECONDS + 60) * 1000);
  return true;
}

export async function verifyWalletAuth(
  request: Request,
  action: WalletAuthAction,
  resource?: string,
): Promise<WalletAuth | null> {
  const address = request.headers.get(AUTH_HEADERS.address) ?? "";
  const encodedMessage = request.headers.get(AUTH_HEADERS.message) ?? "";
  const signature = request.headers.get(AUTH_HEADERS.signature) ?? "";

  if (!ADDRESS_RE.test(address) || !SIGNATURE_RE.test(signature)) return null;

  const message = decodeWalletAuthMessage(encodedMessage);

  // Message carries the expected action + address and a fresh timestamp.
  const timestampMatch = message.match(/^Timestamp: (.+)$/m);
  if (!timestampMatch) return null;
  const timestamp = timestampMatch[1];
  const age = Math.abs(Date.now() - Date.parse(timestamp));
  if (!Number.isFinite(age) || age > AUTH_MAX_AGE_SECONDS * 1000) return null;

  if (message !== buildWalletAuthMessage(action, address, timestamp, resource)) return null;

  let recovered: string;
  try {
    recovered = await recoverMessageAddress({ message, signature: signature as `0x${string}` });
  } catch {
    return null;
  }
  if (recovered.toLowerCase() !== address.toLowerCase()) return null;

  // Only a valid signature is recorded, so junk requests cannot fill the cache.
  if (!consumeSignature(signature)) return null;

  return { address: address.toLowerCase() };
}

// Per-IP limiter shared with the other routes (see rateLimit.ts). In memory
// per server instance: it stops casual abuse, it is not a WAF.
export function rateLimit(request: Request): boolean {
  return checkRateLimit(`api:${clientIpFromRequest(request)}`, 30, 60_000).allowed;
}
