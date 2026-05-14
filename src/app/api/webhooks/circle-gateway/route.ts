import { NextResponse } from "next/server";
import { recordGatewayWebhook } from "@/lib/db/gatewayWebhooks";
import { normalizeGatewayWebhook } from "@/lib/gatewayWebhooks";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const webhook = normalizeGatewayWebhook(payload);
    const result = await recordGatewayWebhook(webhook);

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      duplicate: result.duplicate,
      notificationId: webhook.notificationId,
      notificationType: webhook.notificationType,
      activityEvent: webhook.activityEvent.event_type,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to process Gateway webhook.",
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "ArcHive Circle Gateway webhook endpoint",
    status: "ready",
    endpoint: "/api/webhooks/circle-gateway",
    supportedEvents: [
      "gateway.deposit.finalized",
      "gateway.mint.finalized",
      "gateway.mint.forwarded",
    ],
  });
}
