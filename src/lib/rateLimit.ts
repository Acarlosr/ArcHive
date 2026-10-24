interface RateLimitBucket {
  hits: number[];
}

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((ts) => now - ts < windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((windowMs - (now - oldest)) / 1000), 1),
    };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.hits.every((ts) => now - ts >= windowMs)) buckets.delete(k);
    }
  }
  return {
    allowed: true,
    remaining: Math.max(limit - bucket.hits.length, 0),
    retryAfterSeconds: 0,
  };
}

export function clientIpFromRequest(request: Request) {
  // The first x-forwarded-for hop is client-controlled (spoofable). Prefer the
  // platform-set header, then the LAST hop (appended by our own proxy).
  const real = request.headers.get("x-real-ip") ?? request.headers.get("x-vercel-forwarded-for");
  if (real) return real.split(",")[0].trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((hop) => hop.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "unknown";
}
