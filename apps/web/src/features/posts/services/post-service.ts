"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { PaginatedPosts, Post, PostFormValues, PostStatus } from "../types/post.types";

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

export function listPublishedPosts() {
  return apiRequest<Post[]>("/posts/public");
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
