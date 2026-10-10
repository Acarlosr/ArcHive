// src/lib/serverWalletAuth.ts
// Server-side validation of wallet-signed request headers.
// Proves the caller owns the wallet it claims before any write reaches
// the database with the service role key.

import { recoverMessageAddress } from "viem";
import {
  AUTH_HEADERS,
  AUTH_MAX_AGE_SECONDS,
  buildWalletAuthMessage,
  decodeWalletAuthMessage,
  type WalletAuthAction,
} from "./walletAuthMessage";

export interface WalletAuth {
  address: string;
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const SIGNATURE_RE = /^0x[0-9a-fA-F]{130}$/;

export async function verifyWalletAuth(request: Request, action: WalletAuthAction): Promise<WalletAuth | null> {
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

  if (message !== buildWalletAuthMessage(action, address, timestamp)) return null;

  let recovered: string;
  try {
    recovered = await recoverMessageAddress({ message, signature: signature as `0x${string}` });
  } catch {
    return null;
  }
  if (recovered.toLowerCase() !== address.toLowerCase()) return null;

  return { address: address.toLowerCase() };
}

// ─────────────────────────────────────────────
// Naive per-IP rate limiter (in-memory, per server instance).
// Enough to stop obvious abuse in this stage; not a WAF.
// ─────────────────────────────────────────────

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0].trim() : "local") || "local";
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_MAX_REQUESTS;
}
