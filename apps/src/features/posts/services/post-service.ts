"use client";

import { apiRequest } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";
import type { PaginatedPosts, Post, PostCategory, PostFormValues, PostStatus, PostTag, TaxonomyFormValues } from "../types/post.types";

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

export function getPost(postId: string) {
  return apiRequest<Post>(`/posts/${postId}`, {
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
    body: sanitizePost(values)
  });
}

export function updatePost(postId: string, values: PostFormValues) {
  return apiRequest<Post>(`/posts/${postId}`, {
    method: "PUT",
    token: getToken(),
    body: sanitizePost(values)
  });
}

function sanitizePost(values: PostFormValues) {
  return {
    ...values,
    title: values.title.trim(),
    excerpt: values.excerpt.trim() || null,
    content: values.content.trim(),
    categoryId: values.categoryId || null,
    coverImage: values.coverImage ?? null
  };
}

export function deletePost(postId: string) {
  return apiRequest<{ id: string }>(`/posts/${postId}`, {
    method: "DELETE",
    token: getToken()
  });
}

export function listPostCategories() {
  return apiRequest<PostCategory[]>("/posts/categories", {
    token: getToken()
  });
}

export function createPostCategory(values: TaxonomyFormValues) {
  return apiRequest<PostCategory>("/posts/categories", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updatePostCategory(categoryId: string, values: TaxonomyFormValues) {
  return apiRequest<PostCategory>(`/posts/categories/${categoryId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deletePostCategory(categoryId: string) {
  return apiRequest<{ id: string }>(`/posts/categories/${categoryId}`, {
    method: "DELETE",
    token: getToken()
  });
}

export function listPostTags() {
  return apiRequest<PostTag[]>("/posts/tags", {
    token: getToken()
  });
}

export function createPostTag(values: TaxonomyFormValues) {
  return apiRequest<PostTag>("/posts/tags", {
    method: "POST",
    token: getToken(),
    body: values
  });
}

export function updatePostTag(tagId: string, values: TaxonomyFormValues) {
  return apiRequest<PostTag>(`/posts/tags/${tagId}`, {
    method: "PUT",
    token: getToken(),
    body: values
  });
}

export function deletePostTag(tagId: string) {
  return apiRequest<{ id: string }>(`/posts/tags/${tagId}`, {
    method: "DELETE",
    token: getToken()
  });
}
