import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoActivityEvents, isDemoMode, type DemoActivityEvent } from "@/lib/demoData";

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

export async function recordActivityEvent(event: Omit<ActivityEvent, "id" | "created_at">) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from("activity_events").insert(event);
  if (error) throw new Error(error.message);
}
