"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { invalidateListCache, readListCache, writeListCache } from "@/lib/list-cache";

type UseCachedResourceOptions<T> = {
  cacheKey: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
};

export function useCachedResource<T>({ cacheKey, fetcher, enabled = true }: UseCachedResourceOptions<T>) {
  const cached = enabled ? readListCache<T>(cacheKey) : null;
  const [data, setData] = useState<T | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached && enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(
    async (options?: { silent?: boolean; bustCache?: boolean }) => {
      if (!enabled) {
        return null;
      }

      if (options?.bustCache) {
        invalidateListCache(cacheKey);
      }

      const existing = readListCache<T>(cacheKey);

      if (existing && !options?.bustCache) {
        setData(existing);
        setIsLoading(false);
        setIsRefreshing(true);
      } else if (!options?.silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const result = await fetcherRef.current();
        writeListCache(cacheKey, result);
        setData(result);
        return result;
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [cacheKey, enabled]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void reload({ silent: Boolean(readListCache<T>(cacheKey)) });
  }, [cacheKey, enabled, reload]);

  return {
    data,
    isLoading,
    isRefreshing,
    reload,
    setData
  };
}

export function bustCache(prefix: string) {
  invalidateListCache(prefix);
}
