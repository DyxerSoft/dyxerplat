"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { Permission, Role, RoleFormValues } from "../types/role.types";

function getToken() {
  const session = getStoredSession();
  return session?.token ?? null;
}

export function listRoles() {
  return apiRequest<Role[]>("/roles", {
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
