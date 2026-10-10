// src/app/api/agents/[id]/route.ts
// Agent reputation and completed-jobs updates. Signed by a wallet.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const auth = await verifyWalletAuth(request, "update_agent");
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

  const patch: Record<string, unknown> = {};
  if (body.reputation_score !== undefined) {
    const score = Number(body.reputation_score);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      return NextResponse.json({ error: "reputation_score must be between 0 and 10" }, { status: 400 });
    }
    patch.reputation_score = score;
  }
  if (body.increment_jobs_completed === true) {
    const { data: agent } = await admin.from("agents").select("jobs_completed").eq("id", id).single();
    patch.jobs_completed = ((agent?.jobs_completed as number | undefined) ?? 0) + 1;
  }
  if (body.onchain_agent_id) patch.onchain_agent_id = String(body.onchain_agent_id).slice(0, 80);
  if (body.tx_hash) patch.tx_hash = String(body.tx_hash).slice(0, 80);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await admin.from("agents").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
