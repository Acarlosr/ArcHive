// src/app/api/jobs/[id]/route.ts
// Job status updates. Signed by the job's client or provider wallet;
// the server reads the current row first to check who is authorized.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

const ALLOWED_STATUSES = new Set([
  "open",
  "funded",
  "accepted",
  "submitted",
  "completed",
  "rejected",
  "refunded",
  "expired",
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const auth = await verifyWalletAuth(request, "update_job");
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

  const status = body.status ? String(body.status) : null;
  if (status && !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: `Status must be one of: ${[...ALLOWED_STATUSES].join(", ")}` }, { status: 400 });
  }

  const { data: job, error: lookupError } = await admin
    .from("jobs")
    .select("client_wallet, provider_wallet")
    .eq("id", id)
    .single();
  if (lookupError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const signer = auth.address;
  const isClient = String(job.client_wallet ?? "").toLowerCase() === signer;
  const isProvider = job.provider_wallet && String(job.provider_wallet).toLowerCase() === signer;
  if (!isClient && !isProvider) {
    return NextResponse.json({ error: "Only the job's client or provider can update it" }, { status: 403 });
  }

  // Only field updates that make sense per transition, all capped.
  const extras: Record<string, unknown> = {};
  if (body.deliverable_hash) extras.deliverable_hash = String(body.deliverable_hash).slice(0, 80);
  if (body.submitted_at) extras.submitted_at = String(body.submitted_at);
  if (body.tx_hash) extras.tx_hash = String(body.tx_hash).slice(0, 80);
  if (body.onchain_id) extras.onchain_id = String(body.onchain_id).slice(0, 80);
  if (body.onchain_job_id) extras.onchain_job_id = String(body.onchain_job_id).slice(0, 80);
  if (isProvider && !job.provider_wallet) extras.provider_wallet = signer;

  const update: Record<string, unknown> = { ...extras };
  if (status) update.status = status;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await admin.from("jobs").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
