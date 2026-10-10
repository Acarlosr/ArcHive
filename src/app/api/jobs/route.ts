// src/app/api/jobs/route.ts
// Job record creation. Server-side only: requires a wallet-signed header
// (X-ArcAuth-*) and writes with the service role key.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

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

  const payload = {
    title,
    description,
    short_description: shortDescription,
    budget_usdc: budget,
    budget,
    status: String(body.status ?? "open").slice(0, 20),
    client_wallet: clientWallet,
    provider_wallet: body.provider_wallet ? String(body.provider_wallet).toLowerCase() : null,
    agent_id: body.agent_id ? String(body.agent_id) : null,
    agent_name: body.agent_name ? String(body.agent_name).slice(0, 120) : null,
    onchain_job_id: body.onchain_job_id ?? body.onchain_id ?? null,
    tx_hash: body.tx_hash ? String(body.tx_hash).slice(0, 80) : null,
    expires_at: body.expires_at ? String(body.expires_at) : new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  };

  const { data, error } = await admin.from("jobs").insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ job: data }, { status: 201 });
}
