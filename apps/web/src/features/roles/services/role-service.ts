"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { Permission, Role, RoleFormValues, RolesPage } from "../types/role.types";

function getToken() {
  const session = getStoredSession();
  return session?.token ?? null;
}

export function listRoles() {
  return listRolesPage({ pageSize: 100 }).then((result) => result.items);
}

export function listRolesPage(params: { q?: string; type?: string; page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.type) query.set("type", params.type);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));
  return apiRequest<RolesPage>(`/roles?${query.toString()}`, {
    token: getToken()
  });
}

export function listPermissions() {
  return apiRequest<Permission[]>("/roles/permissions", {
    token: getToken()
  });
}

export function createRole(values: RoleFormValues) {
  return apiRequest<Role>("/roles", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updateRole(roleId: string, values: RoleFormValues) {
  return apiRequest<Role>(`/roles/${roleId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deleteRole(roleId: string) {
  return apiRequest<{ id: string }>(`/roles/${roleId}`, {
    method: "DELETE",
    token: getToken()
  });
}
