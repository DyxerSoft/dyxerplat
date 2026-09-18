import { ApiClientError } from "@/lib/api-client";
import { getStoredSession } from "@/features/auth/auth-service";

type ValidationDetails = {
  errors?: string[];
  fields?: Record<string, string[] | undefined>;
};

export function getErrorMessage(error: unknown, fallback = "No se pudo completar la accion.") {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  if (error.code === "VALIDATION_ERROR") {
    const details = error.details as ValidationDetails | null | undefined;

    if (Array.isArray(details?.errors) && details.errors.length > 0) {
      return details.errors.length === 1
        ? details.errors[0]
        : `Revisa estos datos: ${details.errors.join(" · ")}`;
    }

    if (details?.fields) {
      const fieldMessages = Object.entries(details.fields)
        .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`));

      if (fieldMessages.length > 0) {
        return fieldMessages.length === 1
          ? fieldMessages[0]
          : `Revisa estos datos: ${fieldMessages.join(" · ")}`;
      }
    }
  }

  return error.message || fallback;
}

export function getSessionPermissions() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  return getStoredSession()?.user.permissions ?? [];
}

export function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function emptyToUndefined(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
