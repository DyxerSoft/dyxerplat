"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { BlogTaxonomy, PaginatedPosts, Post, PostFormValues, PostStatus, PublicPostsPage } from "../types/post.types";

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

export function listPosts(params: { q?: string; status?: PostStatus | ""; page?: number; pageSize?: number }) {
  return apiRequest<PaginatedPosts>(`/posts${queryString(params)}`, {
    token: getToken()
  });
}

export function listPublishedPosts(params: { q?: string; category?: string; tag?: string; page?: number; pageSize?: number } = {}) {
  return apiRequest<PublicPostsPage>(`/posts/public${queryString(params)}`);
}

export function getPublishedPost(slug: string) {
  return apiRequest<Post>(`/posts/public/${slug}`);
}

export function createPost(values: PostFormValues) {
  return apiRequest<Post>("/posts", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updatePost(postId: string, values: PostFormValues) {
  return apiRequest<Post>(`/posts/${postId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deletePost(postId: string) {
  return apiRequest<{ id: string }>(`/posts/${postId}`, {
    method: "DELETE",
    token: getToken()
  });
}

type TaxonomyKind = "categories" | "tags";
export function listTaxonomies(kind: TaxonomyKind) { return apiRequest<BlogTaxonomy[]>(`/posts/${kind}`, { token: getToken() }); }
export function createTaxonomy(kind: TaxonomyKind, name: string) { return apiRequest<BlogTaxonomy>(`/posts/${kind}`, { method: "POST", token: getToken(), body: { name } }); }
export function updateTaxonomy(kind: TaxonomyKind, id: string, name: string) { return apiRequest<BlogTaxonomy>(`/posts/${kind}/${id}`, { method: "PUT", token: getToken(), body: { name } }); }
export function deleteTaxonomy(kind: TaxonomyKind, id: string) { return apiRequest<{ id: string }>(`/posts/${kind}/${id}`, { method: "DELETE", token: getToken() }); }
