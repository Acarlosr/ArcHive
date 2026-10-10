// src/app/api/links/route.ts
// Pay link creation. Signed by the creator wallet; recipient comes from
// the request but the signed wallet must match creator_wallet.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";

const LINK_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateLinkId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let id = "";
  for (const byte of bytes) id += LINK_ID_ALPHABET[byte % LINK_ID_ALPHABET.length];
  return id;
}

export async function POST(request: Request) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const auth = await verifyWalletAuth(request, "create_link");
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

  const amount = String(body.amount ?? "").trim();
  const description = String(body.description ?? "").slice(0, 300).trim();
  const recipientWallet = String(body.recipient_wallet ?? "").toLowerCase().trim();
  const creatorWallet = String(body.creator_wallet ?? "").toLowerCase().trim();

  if (!/^\d+(\.\d{1,6})?$/.test(amount) || parseFloat(amount) <= 0 || parseFloat(amount) > 1_000_000) {
    return NextResponse.json({ error: "Amount must be a positive number (max 1,000,000)" }, { status: 400 });
  }
  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!/^0x[0-9a-fA-F]{40}$/.test(recipientWallet)) {
    return NextResponse.json({ error: "recipient_wallet must be a valid address" }, { status: 400 });
  }
  if (creatorWallet !== auth.address) {
    return NextResponse.json({ error: "creator_wallet must match the signed wallet" }, { status: 403 });
  }
  if (body.expiry) {
    const expiry = new Date(String(body.expiry));
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() < Date.now()) {
      return NextResponse.json({ error: "Expiry must be a future date" }, { status: 400 });
    }
  }

  const { data, error } = await admin
    .from("pay_links")
    .insert({
      id: generateLinkId(),
      amount,
      description,
      recipient_wallet: recipientWallet,
      creator_wallet: creatorWallet,
      accepted_chains: Array.isArray(body.accepted_chains)
        ? body.accepted_chains.slice(0, 6).map((c: unknown) => String(c).slice(0, 30))
        : ["Arc"],
      expiry: body.expiry ? String(body.expiry) : null,
      status: "pending",
      tx_hash: null,
      explorer_url: null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ link: data }, { status: 201 });
}
