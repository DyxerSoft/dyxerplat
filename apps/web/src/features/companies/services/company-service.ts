"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type {
  Company,
  CompanyContact,
  CompanyFormValues,
  CompanyStatus,
  ContactFormValues,
  PaginatedCompanies
  , PaginatedContacts
} from "../types/company.types";

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

export function listCompanies(params: {
  q?: string;
  status?: CompanyStatus | "";
  page?: number;
  pageSize?: number;
}) {
  return apiRequest<PaginatedCompanies>(`/companies${queryString(params)}`, {
    token: getToken()
  });
}

export function createCompany(values: CompanyFormValues) {
  return apiRequest<Company>("/companies", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function getCompany(companyId: string) {
  return apiRequest<Company>(`/companies/${companyId}`, { token: getToken() });
}

export function updateCompany(companyId: string, values: CompanyFormValues) {
  return apiRequest<Company>(`/companies/${companyId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deleteCompany(companyId: string) {
  return apiRequest<{ id: string }>(`/companies/${companyId}`, {
    method: "DELETE",
    token: getToken()
  });
}

export function listContacts(companyId: string, params: { q?: string; status?: CompanyStatus | ""; page?: number; pageSize?: number } = {}) {
  return apiRequest<PaginatedContacts>(`/companies/${companyId}/contacts${queryString(params)}`, {
    token: getToken()
  });
}

export function createContact(companyId: string, values: ContactFormValues) {
  return apiRequest<CompanyContact>(`/companies/${companyId}/contacts`, {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updateContact(companyId: string, contactId: string, values: ContactFormValues) {
  return apiRequest<CompanyContact>(`/companies/${companyId}/contacts/${contactId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deleteContact(companyId: string, contactId: string) {
  return apiRequest<{ id: string }>(`/companies/${companyId}/contacts/${contactId}`, {
    method: "DELETE",
    token: getToken()
  });
}
