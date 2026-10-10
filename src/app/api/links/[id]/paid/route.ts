// src/app/api/links/[id]/paid/route.ts
// Marks a pay link as paid — server-side only.
// The on-chain receipt is verified here (USDC transfer to the link's
// recipient), so the browser can never fake a payment or rewrite the
// destination (issues #1 and #2).

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";
import { verifyWalletAuth, rateLimit } from "@/lib/serverWalletAuth";
import { verifyUsdcPayment } from "@/lib/verifyPayment";
import { explorerTxUrl } from "@/lib/safeUrls";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const auth = await verifyWalletAuth(request, "pay_link");
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

  const txHash = String(body.tx_hash ?? "");
  const { data: link, error: lookupError } = await admin
    .from("pay_links")
    .select("id, amount, recipient_wallet, status, creator_wallet")
    .eq("id", id)
    .single();

  if (lookupError || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (link.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  // On-chain verification: the tx must really pay this link's recipient.
  const verification = await verifyUsdcPayment({
    txHash,
    recipient: link.recipient_wallet,
    expectedAmount: String(link.amount),
  });
  if (!verification.ok) {
    return NextResponse.json({ error: verification.reason ?? "Payment not verified on-chain" }, { status: 400 });
  }

  const { error } = await admin
    .from("pay_links")
    .update({
      status: "paid",
      tx_hash: txHash,
      explorer_url: explorerTxUrl(txHash),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, verified: true, amount: verification.amountTransferred });
}
