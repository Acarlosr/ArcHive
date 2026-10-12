// src/app/api/rpc/route.ts
// Same-origin JSON-RPC proxy for the Arc public client.
//
// Why: privacy browsers (Helium, Brave) and adblockers block direct browser
// fetches to arc.io (arc.io is a known third-party analytics domain in
// privacy filter lists) and the mainnet arc.network endpoints are dead
// (NXDOMAIN since 12/10/2026). Same-origin calls to this route always pass.
//
// Read-only by design: transaction signing/sending goes through the wallet
// provider (Dynamic), never through here. Methods are whitelisted and the
// route is rate limited to avoid becoming an open relay.

import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rateLimit";
import { ARC_RPC_URLS } from "@/lib/arc/rpc";

const ALLOWED_METHODS = new Set([
  "web3_clientVersion",
  "net_version",
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_getBlockReceipts",
  "eth_getBalance",
  "eth_getTransactionCount",
  "eth_getCode",
  "eth_getStorageAt",
  "eth_getTransactionReceipt",
  "eth_getLogs",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_feeHistory",
  "eth_maxPriorityFeePerGas",
  "eth_getBlockTransactionCountByNumber",
  "eth_getBlockTransactionCountByHash",
]);

const UPSTREAM_TIMEOUT_MS = 10_000;

function isJsonRpcRequest(value: unknown): value is { method: string } {
  if (typeof value !== "object" || value === null) return false;
  const request = value as Record<string, unknown>;
  return typeof request.method === "string" && ("id" in request || "params" in request);
}

function extractMethods(body: unknown): string[] | null {
  if (Array.isArray(body)) {
    if (body.length === 0) return null;
    return body.map((item) => {
      if (!isJsonRpcRequest(item)) return "";
      return item.method;
    });
  }
  if (!isJsonRpcRequest(body)) return null;
  return [body.method];
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(`rpc-proxy:${ip}`, 240, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const methods = extractMethods(body);
  if (!methods || methods.some((method) => !ALLOWED_METHODS.has(method))) {
    return NextResponse.json(
      { ok: false, error: "Method not allowed by the ArcHive RPC proxy" },
      { status: 400 },
    );
  }

  for (const url of ARC_RPC_URLS) {
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        cache: "no-store",
      });
      if (!upstream.ok) continue;
      const payload = await upstream.text();
      return new NextResponse(payload, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { ok: false, error: "All Arc RPC endpoints are unreachable right now. Try again shortly." },
    { status: 502 },
  );
}

export async function GET() {
  return NextResponse.json({
    service: "ArcHive RPC proxy",
    status: "ready",
    endpoint: "/api/rpc",
    methods: "read-only whitelist",
    upstreams: ARC_RPC_URLS.length,
  });
}
