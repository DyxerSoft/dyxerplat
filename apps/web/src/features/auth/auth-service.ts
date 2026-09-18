"use client";

import { apiRequest } from "@/lib/api-client";
import type { AuthSession, AuthUser } from "./types";

const SESSION_STORAGE_KEY = "dyxerplat_session";

export async function loginWithEmail(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: {
      email,
      password
    }
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<AuthUser>("/auth/me", {
    token
  });
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
