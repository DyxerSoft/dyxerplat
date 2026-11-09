"use client";
import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";

export type ProductPlan = { id?: string; name: string; benefits: string[]; price: number; currency: string; additionalInfo: string | null; isActive: boolean };
export type CatalogProduct = { id: string; name: string; slug: string; shortDescription: string; description: string; additionalInfo: string | null; isActive: boolean; plans: ProductPlan[] };
export type ProductInput = Omit<CatalogProduct, "id">;
const token = () => getStoredSession()?.token ?? null;

export function listCatalogProducts() { return apiRequest<CatalogProduct[]>("/products", { token: token() }); }
export function listPublicProducts() { return apiRequest<CatalogProduct[]>("/products/public"); }
export function getPublicProduct(slug: string) { return apiRequest<CatalogProduct>(`/products/public/${encodeURIComponent(slug)}`); }
export function createCatalogProduct(body: ProductInput) { return apiRequest<CatalogProduct>("/products", { method: "POST", token: token(), body }); }
export function updateCatalogProduct(id: string, body: ProductInput) { return apiRequest<CatalogProduct>(`/products/${id}`, { method: "PUT", token: token(), body }); }
export function deleteCatalogProduct(id: string) { return apiRequest<{id:string}>(`/products/${id}`, { method: "DELETE", token: token() }); }
