import type { ActivityEvent } from "@/lib/db/activity";

export type GatewayNotificationType =
  | "gateway.deposit.finalized"
  | "gateway.mint.finalized"
  | "gateway.mint.forwarded";

export interface GatewayWebhookEnvelope {
  subscriptionId: string;
  notificationId: string;
  notificationType: GatewayNotificationType | string;
  notification: Record<string, unknown>;
  timestamp: string;
  version: number;
}

export interface NormalizedGatewayWebhook {
  notificationId: string;
  notificationType: GatewayNotificationType;
  subscriptionId: string;
  occurredAt: string;
  activityEvent: Omit<ActivityEvent, "id" | "created_at">;
  rawPayload: GatewayWebhookEnvelope;
}

const eventTypeMap: Record<GatewayNotificationType, ActivityEvent["event_type"]> = {
  "gateway.deposit.finalized": "gateway_deposit_finalized",
  "gateway.mint.finalized": "gateway_mint_finalized",
  "gateway.mint.forwarded": "gateway_mint_forwarded",
};

export function isGatewayNotificationType(value: string): value is GatewayNotificationType {
  return value === "gateway.deposit.finalized" ||
    value === "gateway.mint.finalized" ||
    value === "gateway.mint.forwarded";
}

export function normalizeGatewayWebhook(payload: unknown): NormalizedGatewayWebhook {
  if (!payload || typeof payload !== "object") {
    throw new Error("Gateway webhook payload must be a JSON object.");
  }

  const envelope = payload as Partial<GatewayWebhookEnvelope>;
  const notificationType = String(envelope.notificationType ?? "");
  const notificationId = String(envelope.notificationId ?? "");
  const subscriptionId = String(envelope.subscriptionId ?? "");
  const timestamp = String(envelope.timestamp ?? new Date().toISOString());
  const notification =
    envelope.notification && typeof envelope.notification === "object"
      ? envelope.notification as Record<string, unknown>
      : {};

  if (!notificationId) {
    throw new Error("Gateway webhook notificationId is required for dedupe.");
  }

  if (!isGatewayNotificationType(notificationType)) {
    throw new Error(`Unsupported Gateway notification type: ${notificationType || "unknown"}`);
  }

  const walletAddress = String(notification.walletAddress ?? notification.from ?? "");
  const txHash = String(notification.txHash ?? "");
  const amount = readAmount(notification);
  const domain = String(notification.domain ?? "");
  const tokenAddress = String(notification.tokenAddress ?? "");
  const env = String(notification.env ?? "");
  const transferId = typeof notification.transferId === "string" ? notification.transferId : null;
  const wasForwarded =
    typeof notification.wasForwarded === "boolean" ? notification.wasForwarded : null;

  return {
    notificationId,
    notificationType,
    subscriptionId,
    occurredAt: timestamp,
    rawPayload: payload as GatewayWebhookEnvelope,
    activityEvent: {
      event_type: eventTypeMap[notificationType],
      related_job_id: null,
      related_agent_id: null,
      wallet_address: walletAddress,
      tx_hash: txHash,
      metadata_json: {
        notificationId,
        subscriptionId,
        notificationType,
        amount,
        domain,
        env,
        tokenAddress,
        transferId,
        wasForwarded,
      },
    },
  };
}

function readAmount(notification: Record<string, unknown>) {
  if (typeof notification.amount === "string") {
    return notification.amount;
  }

  const attestations = Array.isArray(notification.attestations)
    ? notification.attestations as Array<Record<string, unknown>>
    : [];
  const firstAmount = attestations.find((item) => typeof item.amount === "string")?.amount;

  return typeof firstAmount === "string" ? firstAmount : null;
}
