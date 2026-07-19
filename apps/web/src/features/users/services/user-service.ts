"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { PaginatedUsers, User, UserFormValues, UserStatus } from "../types/user.types";

function getToken() {
  const session = getStoredSession();
  return session?.token ?? null;
}

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const value = search.toString();
  return value ? `?${value}` : "";
}

export function listUsers(params: {
  q?: string;
  status?: UserStatus | "";
  roleId?: string;
  page?: number;
  pageSize?: number;
}) {
  return apiRequest<PaginatedUsers>(`/users${queryString(params)}`, {
    token: getToken()
  });
}

export function createUser(values: UserFormValues) {
  return apiRequest<User>("/users", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updateUser(userId: string, values: UserFormValues) {
  return apiRequest<User>(`/users/${userId}`, {
    method: "PUT",
    token: getToken(),
    body: {
      ...values,
      password: values.password || undefined
    }
  });
}

export function deleteUser(userId: string) {
  return apiRequest<{ id: string }>(`/users/${userId}`, {
    method: "DELETE",
    token: getToken()
  });
}
