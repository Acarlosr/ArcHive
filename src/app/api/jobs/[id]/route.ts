// src/app/api/jobs/[id]/route.ts
// Job status updates. Three layers of protection:
//   1. wallet signature bound to this job id (replay on another job fails);
//   2. role + state machine: only valid transitions, by the allowed party;
//   3. financial states (funded/completed/rejected/refunded) need a successful
//      on-chain transaction that really belongs to this job.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";
import { verifyMarketplaceTx } from "@/lib/verifyTx";

type Role = "client" | "provider";

// from -> { to: roles allowed to make that move }
// Financial moves accept either party: the on-chain proof (below) is the real
// guard, and the contract itself decides who may call complete/reject/refund.
const BOTH: Role[] = ["client", "provider"];
const TRANSITIONS: Record<string, Record<string, Role[]>> = {
  open: { accepted: ["provider"], funded: ["client"], rejected: BOTH, expired: BOTH },
  funded: { accepted: ["provider"], submitted: ["provider"], rejected: BOTH, refunded: BOTH, expired: BOTH },
  accepted: { funded: ["client"], submitted: ["provider"], rejected: BOTH, refunded: BOTH, expired: BOTH },
  submitted: { completed: BOTH, rejected: BOTH, refunded: BOTH, expired: BOTH },
};

const FINANCIAL_STATUSES = new Set(["funded", "completed", "rejected", "refunded"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const auth = await verifyWalletAuth(request, "update_job", id);
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

  const { data: job, error: lookupError } = await admin
    .from("jobs")
    .select("client_wallet, provider_wallet, status, onchain_job_id, onchain_id")
    .eq("id", id)
    .single();
  if (lookupError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const signer = auth.address;
  const isClient = String(job.client_wallet ?? "").toLowerCase() === signer;
  const isProvider = Boolean(job.provider_wallet) && String(job.provider_wallet).toLowerCase() === signer;
  if (!isClient && !isProvider) {
    return NextResponse.json({ error: "Only the job's client or provider can update it" }, { status: 403 });
  }

  const onchainJobId = String(job.onchain_job_id ?? job.onchain_id ?? body.onchain_job_id ?? body.onchain_id ?? "") || null;
  const txHash = body.tx_hash ? String(body.tx_hash).slice(0, 80) : null;

  if (status) {
    const allowedRoles = TRANSITIONS[String(job.status)]?.[status];
    if (!allowedRoles) {
      return NextResponse.json(
        { error: `Invalid transition: ${job.status} -> ${status}` },
        { status: 400 },
      );
    }
    const roles: Role[] = [];
    if (isClient) roles.push("client");
    if (isProvider) roles.push("provider");
    if (!roles.some((role) => allowedRoles.includes(role))) {
      return NextResponse.json({ error: `Only the ${allowedRoles.join(" or ")} can move a job to ${status}` }, { status: 403 });
    }

    if (FINANCIAL_STATUSES.has(status)) {
      if (!txHash) {
        return NextResponse.json({ error: `tx_hash is required to mark a job ${status}` }, { status: 400 });
      }
      const proof = await verifyMarketplaceTx(txHash, { onchainJobId });
      if (!proof.ok) {
        return NextResponse.json({ error: proof.reason ?? "Transaction not verified on-chain" }, { status: 400 });
      }
    }
  }

  // Only fields that make sense per transition, all capped.
  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (body.deliverable_hash) update.deliverable_hash = String(body.deliverable_hash).slice(0, 80);
  if (body.submitted_at) update.submitted_at = String(body.submitted_at);
  if (txHash) update.tx_hash = txHash;
  // On-chain ids are write-once: they cannot be re-pointed after being set.
  if (!job.onchain_id && body.onchain_id) update.onchain_id = String(body.onchain_id).slice(0, 80);
  if (!job.onchain_job_id && body.onchain_job_id) update.onchain_job_id = String(body.onchain_job_id).slice(0, 80);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await admin.from("jobs").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
