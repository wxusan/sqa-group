import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export async function checkRateLimit(scope: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || headersList.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    cleanupBuckets(now);
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function cleanupBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
