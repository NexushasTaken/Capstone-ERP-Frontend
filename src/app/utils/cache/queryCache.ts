interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cacheStore = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | undefined {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key)
    return undefined
  }

  return entry.data
}

export function setCached<T>(key: string, data: T, ttlMs: number): void {
  cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// Call after a mutation (e.g. creating a product) so stale reads don't linger.
export function invalidateCache(prefix: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) cacheStore.delete(key)
  }
}