// src/lib/webhookSignature.ts
// Server-side verification of Circle v2 webhook signatures (ECDSA_SHA_256).
// Every Circle webhook carries X-Circle-Signature + X-Circle-Key-Id; the public
// key is fetched once per keyId from api.circle.com and cached (keys are static).
// Fail-closed: if CIRCLE_API_KEY is configured, unsigned or bad-signature
// requests are rejected. Demo mode (no Supabase envs) stays open for local dev.

import { createPublicKey, createVerify, type KeyObject } from "node:crypto";
import { isDemoMode } from "@/lib/demoData";

const CIRCLE_PUBLIC_KEY_URL = "https://api.circle.com/v2/notifications/publicKey";
const PUBLIC_KEY_FETCH_TIMEOUT_MS = 5_000;

export interface CircleSignatureHeaders {
  signature: string;
  keyId: string;
}

export type WebhookVerificationResult =
  | { ok: true; verified: boolean; mode: "live" | "demo" }
  | { ok: false; status: 401 | 403; error: string };

const publicKeyCache = new Map<string, KeyObject>();

export function extractCircleSignatureHeaders(request: Request): CircleSignatureHeaders | null {
  const signature = request.headers.get("x-circle-signature") ?? "";
  const keyId = request.headers.get("x-circle-key-id") ?? "";

  if (!signature || !keyId) return null;
  return { signature, keyId };
}

export async function getCircleNotificationPublicKey(keyId: string): Promise<KeyObject | null> {
  const cached = publicKeyCache.get(keyId);
  if (cached) return cached;

  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${CIRCLE_PUBLIC_KEY_URL}/${encodeURIComponent(keyId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(PUBLIC_KEY_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const body = (await response.json()) as {
      data?: { publicKey?: unknown; algorithm?: unknown };
    };
    const publicKeyB64 = body.data?.publicKey;
    if (typeof publicKeyB64 !== "string" || !publicKeyB64) return null;

    const publicKey = createPublicKey({
      key: Buffer.from(publicKeyB64, "base64"),
      format: "der",
      type: "spki",
    });

    publicKeyCache.set(keyId, publicKey);
    return publicKey;
  } catch {
    // Network/key errors fail closed — the caller rejects the webhook.
    return null;
  }
}

export function verifyCircleWebhookSignature(
  rawBody: string,
  signatureB64: string,
  publicKey: KeyObject,
): boolean {
  try {
    const verifier = createVerify("SHA256");
    verifier.update(rawBody);
    return verifier.verify(publicKey, signatureB64, "base64");
  } catch {
    return false;
  }
}

export async function verifyGatewayWebhookRequest(
  request: Request,
  rawBody: string,
): Promise<WebhookVerificationResult> {
  const apiKeyConfigured = Boolean(process.env.CIRCLE_API_KEY);

  if (!apiKeyConfigured) {
    // Demo/dev environments have no API key and no real Circle traffic.
    if (isDemoMode()) {
      return { ok: true, verified: false, mode: "demo" };
    }
    // Live deployment without the verification key: fail closed.
    return {
      ok: false,
      status: 401,
      error:
        "Webhook signature verification is not configured. Set CIRCLE_API_KEY to enable it.",
    };
  }

  const headers = extractCircleSignatureHeaders(request);
  if (!headers) {
    return { ok: false, status: 401, error: "Missing Circle webhook signature headers." };
  }

  const publicKey = await getCircleNotificationPublicKey(headers.keyId);
  if (!publicKey) {
    return { ok: false, status: 401, error: "Unable to resolve Circle webhook signing key." };
  }

  if (!verifyCircleWebhookSignature(rawBody, headers.signature, publicKey)) {
    return { ok: false, status: 403, error: "Invalid Circle webhook signature." };
  }

  return { ok: true, verified: true, mode: "live" };
}
