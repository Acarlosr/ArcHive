// src/lib/db/server.ts
// Server-side Supabase client with the service role key.
// Bypasses RLS — only call from API routes / server code, never import in a client component.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  admin ??= createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return admin;
}
