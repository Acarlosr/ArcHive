// src/app/api/jobs/route.ts
// Job record creation. Server-side only: requires a wallet-signed header
// (X-ArcAuth-*) and writes with the service role key.
// A new record starts "open". "funded" is accepted only with an on-chain proof.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";
import { verifyMarketplaceTx } from "@/lib/verifyTx";

export async function GET() {
  return NextResponse.json({
    service: "ArcHive jobs API",
    status: "ready",
    write: "POST with X-ArcAuth wallet signature",
  });
}

export async function POST(request: Request) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const auth = await verifyWalletAuth(request, "create_job");
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

  const title = String(body.title ?? "").slice(0, 200).trim();
  const description = String(body.description ?? "").slice(0, 5000);
  const shortDescription = String(body.short_description ?? "").slice(0, 200) || description.slice(0, 200);
  const budget = String(body.budget_usdc ?? body.budget ?? "").trim();
  const clientWallet = String(body.client_wallet ?? "").toLowerCase().trim();
  const providerWallet = body.provider_wallet ? String(body.provider_wallet).toLowerCase().trim() : null;
  const status = String(body.status ?? "open").slice(0, 20);
  const txHash = body.tx_hash ? String(body.tx_hash).slice(0, 80) : null;
  const onchainJobId = body.onchain_job_id ?? body.onchain_id ?? null;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!/^\d+(\.\d{1,6})?$/.test(budget) || parseFloat(budget) <= 0) {
    return NextResponse.json({ error: "Budget must be a positive number" }, { status: 400 });
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(clientWallet)) {
    return NextResponse.json({ error: "client_wallet must be a valid address" }, { status: 400 });
  }
  if (clientWallet !== auth.address) {
    return NextResponse.json({ error: "client_wallet must match the signed wallet" }, { status: 403 });
  }
  if (providerWallet && !/^0x[0-9a-f]{40}$/.test(providerWallet)) {
    return NextResponse.json({ error: "provider_wallet must be a valid address" }, { status: 400 });
  }

  // New records are "open" or "funded" (funded needs proof). Nothing else.
  if (status !== "open" && status !== "funded") {
    return NextResponse.json({ error: "New jobs must start as open or funded" }, { status: 400 });
  }
  if (status === "funded") {
    if (!txHash) {
      return NextResponse.json({ error: "tx_hash is required for a funded job" }, { status: 400 });
    }
    const proof = await verifyMarketplaceTx(txHash, {
      onchainJobId: onchainJobId != null ? String(onchainJobId) : null,
    });
    if (!proof.ok) {
      return NextResponse.json({ error: proof.reason ?? "Transaction not verified on-chain" }, { status: 400 });
    }
  }

  // agent_id must point to a real agent (row id or on-chain id).
  let agentId: string | null = null;
  let agentName: string | null = body.agent_name ? String(body.agent_name).slice(0, 120) : null;
  if (body.agent_id) {
    const wanted = String(body.agent_id).slice(0, 80);
    const { data: agent } = await admin
      .from("agents")
      .select("id, name")
      .or(`id.eq.${wanted.replace(/[^\w-]/g, "")},onchain_agent_id.eq.${wanted.replace(/[^\w-]/g, "")}`)
      .limit(1)
      .maybeSingle();
    if (!agent) {
      return NextResponse.json({ error: "agent_id does not match a registered agent" }, { status: 400 });
    }
    agentId = wanted;
    agentName = agent.name ?? agentName;
  }

  const payload = {
    title,
    description,
    short_description: shortDescription,
    budget_usdc: budget,
    budget,
    status,
    client_wallet: clientWallet,
    provider_wallet: providerWallet,
    agent_id: agentId,
    agent_name: agentName,
    onchain_job_id: onchainJobId,
    tx_hash: txHash,
    expires_at: body.expires_at ? String(body.expires_at) : new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  };

  const { data, error } = await admin.from("jobs").insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ job: data }, { status: 201 });
}
