"use client";

import { apiRequest } from "@/lib/api-client";
import { readListCache, writeListCache } from "@/lib/list-cache";

async function warm<T>(cacheKey: string, path: string, token: string) {
  if (readListCache<T>(cacheKey)) {
    return;
  }

  try {
    const data = await apiRequest<T>(path, { token });
    writeListCache(cacheKey, data);
  } catch {
    // Prefetch silencioso: no interrumpe la UI si falla.
  }
}

async function warmRoles(token: string) {
  const cacheKey = "roles:manage=1";

  if (readListCache(cacheKey)) {
    return;
  }

  try {
    const [roles, permissions] = await Promise.all([
      apiRequest<unknown[]>("/roles", { token }),
      apiRequest<unknown[]>("/roles/permissions", { token }).catch(() => [])
    ]);
    writeListCache(cacheKey, { roles, permissions });
  } catch {
    // Prefetch silencioso.
  }
}

/** Precarga listas tipicas del CRM para que la primera navegacion no espere en frio. */
export function warmCrmCache(token: string) {
  if (!token || typeof window === "undefined") {
    return;
  }

  void Promise.allSettled([
    warm("dashboard:stats", "/dashboard/stats", token),
    warm("leads:q=:status=:page=1", "/leads?page=1&pageSize=10", token),
    warm("companies:q=:status=:page=1", "/companies?page=1&pageSize=10", token),
    warm("posts:q=:status=:page=1", "/posts?page=1&pageSize=10", token),
    warm("users:q=:status=:page=1", "/users?page=1&pageSize=10", token),
    warmRoles(token)
  ]);
}
