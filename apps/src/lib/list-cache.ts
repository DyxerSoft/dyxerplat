type CacheEntry<T> = {
  data: T;
  updatedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 45_000;

export function readListCache<T>(key: string, maxAgeMs = DEFAULT_TTL_MS): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.updatedAt > maxAgeMs) {
    return null;
  }

  return entry.data;
}

export function writeListCache<T>(key: string, data: T) {
  store.set(key, {
    data,
    updatedAt: Date.now()
  });
}

export function invalidateListCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
