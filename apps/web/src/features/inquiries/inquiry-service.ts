"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { ContactInquiry, InquiriesPage, InquiryStatus } from "./types";

const token = () => getStoredSession()?.token ?? null;

export function submitInquiry(values: { name: string; company: string; email: string; phone?: string; service: string; message: string }) {
  return apiRequest<{ id: string }>("/inquiries", { method: "POST", body: values });
}

export function listInquiries(params: { q?: string; status?: InquiryStatus | ""; page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 10));
  return apiRequest<InquiriesPage>(`/inquiries?${query}`, { token: token() });
}

export function updateInquiry(id: string, values: { status: InquiryStatus; notes?: string }) {
  return apiRequest<ContactInquiry>(`/inquiries/${id}`, { method: "PATCH", token: token(), body: values });
}

export function deleteInquiry(id: string) {
  return apiRequest<{ id: string }>(`/inquiries/${id}`, { method: "DELETE", token: token() });
}
