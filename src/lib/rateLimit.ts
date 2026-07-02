type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = {
  buckets: Map<string, Bucket>;
};

const globalWithRateLimit = globalThis as typeof globalThis & {
  __nascentRateLimit?: RateLimitStore;
};

const store =
  globalWithRateLimit.__nascentRateLimit ??
  (globalWithRateLimit.__nascentRateLimit = { buckets: new Map<string, Bucket>() });

export function takeFixedWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = store.buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}
