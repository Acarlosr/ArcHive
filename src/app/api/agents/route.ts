// src/app/api/agents/route.ts
// Agent registration. Signed by the creator wallet.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

export async function POST(request: Request) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const auth = await verifyWalletAuth(request, "create_agent");
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

  const name = String(body.name ?? "").slice(0, 120).trim();
  const description = String(body.description ?? "").slice(0, 2000);
  const creatorWallet = String(body.creator_wallet ?? "").toLowerCase().trim();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!/^0x[0-9a-fA-F]{40}$/.test(creatorWallet)) {
    return NextResponse.json({ error: "creator_wallet must be a valid address" }, { status: 400 });
  }
  if (creatorWallet !== auth.address) {
    return NextResponse.json({ error: "creator_wallet must match the signed wallet" }, { status: 403 });
  }

  const capabilities = Array.isArray(body.capabilities)
    ? body.capabilities.slice(0, 12).map((c: unknown) => String(c).slice(0, 40))
    : [];

  const { data, error } = await admin
    .from("agents")
    .insert({
      onchain_agent_id: body.onchain_agent_id ? String(body.onchain_agent_id).slice(0, 80) : null,
      creator_wallet: creatorWallet,
      name,
      description,
      agent_type: body.agent_type ? String(body.agent_type).slice(0, 40) : null,
      capabilities,
      metadata_uri: body.metadata_uri ? String(body.metadata_uri).slice(0, 400) : null,
      tx_hash: body.tx_hash ? String(body.tx_hash).slice(0, 80) : null,
      jobs_completed: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ agent: data }, { status: 201 });
}
