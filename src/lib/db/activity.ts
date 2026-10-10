import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { WalletClient } from "viem";
import { demoActivityEvents, isDemoMode, type DemoActivityEvent } from "@/lib/demoData";
import { postToApi, walletAuthHeaders } from "@/lib/clientWalletAuth";

let supabase: SupabaseClient | null = null;

function getSupabase() {
  if (isDemoMode()) return null;
  supabase ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return supabase;
}

export type ActivityEvent = DemoActivityEvent;

export async function getActivityEvents(): Promise<ActivityEvent[]> {
  const client = getSupabase();
  if (!client) return demoActivityEvents;

  const { data, error } = await client
    .from("activity_events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function recordActivityEvent(
  event: Omit<ActivityEvent, "id" | "created_at">,
  walletClient?: WalletClient | null
) {
  if (isDemoMode()) return;

  try {
    const headers = await walletAuthHeaders("create_link", walletClient ?? null);
    const response = await postToApi("/api/activity", event, headers);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error ?? `Failed to record activity (${response.status})`);
    }
  } catch (err) {
    // Activity log is best-effort: a signing prompt or a transient API
    // failure must never break the main user flow that triggered it.
    console.warn("recordActivityEvent skipped:", err instanceof Error ? err.message : err);
  }
}
