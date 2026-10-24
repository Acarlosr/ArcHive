// src/app/api/links/[id]/paid/route.ts
// Marks a pay link as paid — server-side only.
// Checks, in order:
//   1. wallet signature bound to THIS link id (cannot be replayed on another);
//   2. link exists, is "pending" and not expired;
//   3. the tx hash was never used for another link (also enforced by a UNIQUE
//      index, see supabase/migrations/003_integrity_constraints.sql);
//   4. the on-chain receipt shows a USDC transfer to the recipient, mined
//      after the link was created.

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
  const auth = await verifyWalletAuth(request, "pay_link", id);
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

  const txHash = String(body.tx_hash ?? "").toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
    return NextResponse.json({ error: "invalid tx hash" }, { status: 400 });
  }

  const { data: link, error: lookupError } = await admin
    .from("pay_links")
    .select("id, amount, recipient_wallet, status, creator_wallet, expiry, created_at")
    .eq("id", id)
    .single();

  if (lookupError || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (link.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }
  if (link.status !== "pending") {
    return NextResponse.json({ error: `Link is ${link.status} and cannot be paid` }, { status: 409 });
  }
  if (link.expiry && new Date(link.expiry).getTime() < Date.now()) {
    return NextResponse.json({ error: "Link has expired" }, { status: 409 });
  }

  // The same transaction can never settle two links.
  const { data: reused } = await admin
    .from("pay_links")
    .select("id")
    .ilike("tx_hash", txHash)
    .neq("id", id)
    .limit(1);
  if (reused && reused.length > 0) {
    return NextResponse.json({ error: "This transaction was already used for another link" }, { status: 409 });
  }

  const verification = await verifyUsdcPayment({
    txHash,
    recipient: link.recipient_wallet,
    expectedAmount: String(link.amount),
  });
  if (!verification.ok) {
    return NextResponse.json({ error: verification.reason ?? "Payment not verified on-chain" }, { status: 400 });
  }

  // A payment that predates the link cannot be its payment.
  const createdAt = link.created_at ? Math.floor(new Date(link.created_at).getTime() / 1000) : null;
  if (createdAt && verification.blockTimestamp && verification.blockTimestamp < createdAt - 60) {
    return NextResponse.json({ error: "Transaction predates this link" }, { status: 400 });
  }

  // Compare-and-set on status so two concurrent confirmations cannot both win.
  const { data: updated, error } = await admin
    .from("pay_links")
    .update({
      status: "paid",
      tx_hash: txHash,
      explorer_url: explorerTxUrl(txHash),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");

  if (error) {
    // 23505 = unique_violation on tx_hash
    const duplicate = (error as { code?: string }).code === "23505";
    return NextResponse.json(
      { error: duplicate ? "This transaction was already used for another link" : error.message },
      { status: duplicate ? 409 : 500 },
    );
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }
  // Server-attested feed entry (the browser is not allowed to log link_paid).
  await admin.from("activity_events").insert({
    event_type: "link_paid",
    related_job_id: null,
    related_agent_id: null,
    wallet_address: auth.address,
    tx_hash: txHash,
    metadata_json: { link_id: id, amount: verification.amountTransferred },
  });

  return NextResponse.json({ ok: true, verified: true, amount: verification.amountTransferred });
}
