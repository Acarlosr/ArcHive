// src/app/api/activity/route.ts
// Activity event recording. Signed by a wallet; event fields capped.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

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
    return NextResponse.json({ error: `event_type must be one of: ${[...ALLOWED_EVENT_TYPES].join(", ")}` }, { status: 400 });
  }

  const { error } = await admin.from("activity_events").insert({
    event_type: eventType,
    related_job_id: body.related_job_id ? String(body.related_job_id) : null,
    related_agent_id: body.related_agent_id ? String(body.related_agent_id) : null,
    wallet_address: String(body.wallet_address ?? auth.address).toLowerCase().slice(0, 42),
    tx_hash: body.tx_hash ? String(body.tx_hash).slice(0, 80) : null,
    metadata_json: body.metadata_json ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
