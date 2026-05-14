import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demoData";
import type { NormalizedGatewayWebhook } from "@/lib/gatewayWebhooks";

let serverSupabase: SupabaseClient | null = null;

function getServerSupabase() {
  if (isDemoMode()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  serverSupabase ??= createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  return serverSupabase;
}

export async function recordGatewayWebhook(webhook: NormalizedGatewayWebhook): Promise<{
  duplicate: boolean;
  mode: "demo" | "live";
}> {
  const client = getServerSupabase();

  if (!client) {
    return { duplicate: false, mode: "demo" };
  }

  const { data: existing, error: lookupError } = await client
    .from("gateway_webhook_notifications")
    .select("notification_id")
    .eq("notification_id", webhook.notificationId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existing) {
    return { duplicate: true, mode: "live" };
  }

  const { error: notificationError } = await client
    .from("gateway_webhook_notifications")
    .insert({
      notification_id: webhook.notificationId,
      subscription_id: webhook.subscriptionId,
      notification_type: webhook.notificationType,
      raw_payload: webhook.rawPayload,
      created_at: webhook.occurredAt,
    });

  if (notificationError) {
    throw new Error(notificationError.message);
  }

  const { error: activityError } = await client
    .from("activity_events")
    .insert({
      ...webhook.activityEvent,
      created_at: webhook.occurredAt,
    });

  if (activityError) {
    throw new Error(activityError.message);
  }

  return { duplicate: false, mode: "live" };
}
