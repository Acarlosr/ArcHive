// src/app/api/agents/[id]/route.ts
// Agent updates. Authentication (wallet signature) is not enough: every field
// is also gated by ownership/evidence.
//   - onchain_agent_id / tx_hash: only the agent's creator.
//   - reputation_score: only the client of a COMPLETED job done by this agent
//     (jobs reach "completed" only with an on-chain proof, see api/jobs/[id]).
//   - jobs_completed: derived from the count of completed jobs, never a free
//     increment, so repeating the call changes nothing.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const auth = await verifyWalletAuth(request, "update_agent", id);
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

  const { data: agent, error: lookupError } = await admin
    .from("agents")
    .select("id, creator_wallet, onchain_agent_id, jobs_completed")
    .eq("id", id)
    .single();
  if (lookupError || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const signer = auth.address;
  const isCreator = String(agent.creator_wallet ?? "").toLowerCase() === signer;

  // Completed jobs of this agent (jobs.agent_id may hold the row id or the on-chain id).
  const agentKeys = [String(agent.id), agent.onchain_agent_id ? String(agent.onchain_agent_id) : null].filter(
    (value): value is string => Boolean(value),
  );
  const { data: completedJobs } = await admin
    .from("jobs")
    .select("id, client_wallet")
    .in("agent_id", agentKeys)
    .eq("status", "completed");
  const completed = completedJobs ?? [];
  const isClientOfCompletedJob = completed.some(
    (job) => String(job.client_wallet ?? "").toLowerCase() === signer,
  );

  const patch: Record<string, unknown> = {};

  if (body.onchain_agent_id !== undefined || body.tx_hash !== undefined) {
    if (!isCreator) {
      return NextResponse.json({ error: "Only the agent creator can change identity fields" }, { status: 403 });
    }
    if (body.onchain_agent_id) patch.onchain_agent_id = String(body.onchain_agent_id).slice(0, 80);
    if (body.tx_hash) patch.tx_hash = String(body.tx_hash).slice(0, 80);
  }

  if (body.reputation_score !== undefined) {
    const score = Number(body.reputation_score);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      return NextResponse.json({ error: "reputation_score must be between 0 and 10" }, { status: 400 });
    }
    if (!isClientOfCompletedJob) {
      return NextResponse.json(
        { error: "Only the client of a completed job by this agent can rate it" },
        { status: 403 },
      );
    }
    patch.reputation_score = score;
  }

  if (body.increment_jobs_completed === true) {
    if (!isCreator && !isClientOfCompletedJob) {
      return NextResponse.json({ error: "Not allowed to update this agent" }, { status: 403 });
    }
    // Idempotent: the counter can only follow the real number of completed jobs.
    const current = Number(agent.jobs_completed ?? 0);
    patch.jobs_completed = Math.max(current, Math.min(completed.length, current + 1));
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await admin.from("agents").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
