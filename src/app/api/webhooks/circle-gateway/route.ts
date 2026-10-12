import { NextResponse } from "next/server";
import { recordGatewayWebhook } from "@/lib/db/gatewayWebhooks";
import { normalizeGatewayWebhook } from "@/lib/gatewayWebhooks";
import { isDemoMode } from "@/lib/demoData";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rateLimit";
import { verifyGatewayWebhookRequest } from "@/lib/webhookSignature";

export async function POST(request: Request) {
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `webhook:${clientIpFromRequest(request)}`,
    30,
    60_000,
  );
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many webhook requests from this IP." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  // Signature must be verified over the raw body — re-serializing JSON
  // changes the bytes and breaks the signature (issue #3).
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to read webhook payload." },
      { status: 400 },
    );
  }

  const verification = await verifyGatewayWebhookRequest(request, rawBody);
  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: verification.error },
      { status: verification.status },
    );
  }

  try {
    const payload = JSON.parse(rawBody) as unknown;
    const webhook = normalizeGatewayWebhook(payload);
    const result = await recordGatewayWebhook(webhook);

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      verified: verification.verified,
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
  const signatureVerification = process.env.CIRCLE_API_KEY
    ? "configured"
    : isDemoMode()
      ? "demo"
      : "not-configured";

  return NextResponse.json({
    service: "ArcHive Circle Gateway webhook endpoint",
    status: "ready",
    endpoint: "/api/webhooks/circle-gateway",
    signatureVerification,
    supportedEvents: [
      "gateway.deposit.finalized",
      "gateway.mint.finalized",
      "gateway.mint.forwarded",
    ],
  });
}
