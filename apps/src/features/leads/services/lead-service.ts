"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { Lead, LeadFormValues, LeadStatus, PaginatedLeads } from "../types/lead.types";

function getToken() {
  return getStoredSession()?.token ?? null;
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

export function listLeads(params: { q?: string; status?: LeadStatus | ""; page?: number; pageSize?: number }) {
  return apiRequest<PaginatedLeads>(`/leads${queryString(params)}`, {
    token: getToken()
  });
}

export function updateLead(leadId: string, values: LeadFormValues) {
  return apiRequest<Lead>(`/leads/${leadId}`, {
    method: "PUT",
    token: getToken(),
    body: {
      status: values.status,
      notes: values.notes.trim() || null
    }
  });
}

export function deleteLead(leadId: string) {
  return apiRequest<{ id: string }>(`/leads/${leadId}`, {
    method: "DELETE",
    token: getToken()
  });
}
