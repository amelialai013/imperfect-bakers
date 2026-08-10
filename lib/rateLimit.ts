import { kv } from "@vercel/kv";

// Fixed-window per-IP rate limiter backed by KV. Each (bucket, ip) pair gets
// a counter that expires after windowSeconds; once it exceeds limit within
// that window, requests are rejected until the window rolls over.
export async function isRateLimited(bucket: string, req: Request, limit: number, windowSeconds: number): Promise<boolean> {
  const ip = clientIp(req);
  const key = `ratelimit:${bucket}:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, windowSeconds);
  }
  return count > limit;
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
