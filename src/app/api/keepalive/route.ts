// src/app/api/keepalive/route.ts
// Called daily by a Vercel Cron so the free Supabase project never pauses
// for inactivity. Does one tiny read and returns only ok/not ok.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // If CRON_SECRET is set in Vercel, only the cron (which sends it) may call this.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });

  const { error } = await admin.from("agents").select("id").limit(1);
  if (error) return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true });
}
