type Options = {
  limit: number
  windowMs: number
}

type Result = {
  ok: boolean
  retryAfterSeconds: number
}

type Entry = {
  count: number
  resetAt: number
}

/**
 * Per-instance, in-memory fixed-window limiter. It resets on redeploy and is not shared
 * between serverless instances, which is acceptable here: it exists to stop casual abuse
 * of the contact forms, not to enforce a billing quota.
 */
const buckets = new Map<string, Entry>()

/** Test-only hooks. */
export function __bucketCount() {
  return buckets.size
}

export function __resetRateLimit() {
  buckets.clear()
}

export function checkRateLimit(key: string, { limit, windowMs }: Options): Result {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    // Starting a new window is the one moment the map grows, so prune expired buckets
    // here; otherwise every distinct client IP would stay in memory until a redeploy.
    for (const [k, e] of buckets) {
      if (now >= e.resetAt) buckets.delete(k)
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
