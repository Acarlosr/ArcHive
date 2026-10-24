// src/app/api/activity/route.ts
// Activity event recording. The public feed is a trust signal, so:
//   - the event is always attributed to the SIGNING wallet (no spoofing);
//   - financial events need a tx hash that really exists on Arc and touched
//     the ArcHive marketplace;
//   - the free-form metadata is size-capped.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";
import { verifyMarketplaceTx } from "@/lib/verifyTx";

const ALLOWED_EVENT_TYPES = new Set([
  "agent_registered",
  "job_created",
  "job_funded",
  "job_accepted",
  "job_submitted",
  "job_completed",
  "job_rejected",
  "job_refunded",
  "link_created",
  "link_paid",
  "tool_spend",
  "gateway_event",
  "feedback_recorded",
]);

// Events that claim money moved. They are accepted only with an on-chain proof.
// link_paid / tool_spend / gateway_event are written by server routes
// (pay-link confirmation, Gateway webhook), never accepted from the browser.
const PROOF_REQUIRED = new Set(["job_funded", "job_completed", "job_rejected", "job_refunded"]);
const SERVER_ONLY = new Set(["link_paid", "tool_spend", "gateway_event"]);

const MAX_METADATA_BYTES = 4_000;

export async function POST(request: Request) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const auth = await verifyWalletAuth(request, "log_event");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized: valid wallet signature required" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = String(body.event_type ?? "");
  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: "Unsupported event_type" }, { status: 400 });
  }
  if (SERVER_ONLY.has(eventType)) {
    return NextResponse.json({ error: `${eventType} is recorded by the server only` }, { status: 403 });
  }

  const txHash = body.tx_hash ? String(body.tx_hash).slice(0, 80) : null;
  if (PROOF_REQUIRED.has(eventType)) {
    if (!txHash) {
      return NextResponse.json({ error: `${eventType} requires a tx_hash` }, { status: 400 });
    }
    const proof = await verifyMarketplaceTx(txHash);
    if (!proof.ok) {
      return NextResponse.json({ error: proof.reason ?? "Transaction not verified on-chain" }, { status: 400 });
    }
  }

  let metadata: unknown = body.metadata_json ?? null;
  if (metadata !== null && JSON.stringify(metadata).length > MAX_METADATA_BYTES) {
    metadata = null;
  }

  const { error } = await admin.from("activity_events").insert({
    event_type: eventType,
    related_job_id: body.related_job_id ? String(body.related_job_id).slice(0, 80) : null,
    related_agent_id: body.related_agent_id ? String(body.related_agent_id).slice(0, 80) : null,
    wallet_address: auth.address, // always the signer, never taken from the body
    tx_hash: txHash,
    metadata_json: metadata,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
