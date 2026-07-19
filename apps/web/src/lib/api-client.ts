export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function getUserFacingErrorMessage(error: unknown, fallback = "No se pudo completar la operación.") {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });
  } catch {
    throw new ApiClientError("No se pudo conectar con el servidor. Verifica que la API esté iniciada y vuelve a intentarlo.", 0, "NETWORK_ERROR");
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `El servidor respondió de forma inválida (HTTP ${response.status}). Repórtalo al equipo técnico.`,
      response.status,
      "INVALID_SERVER_RESPONSE"
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiClientError(
      payload.message || "No se pudo completar la solicitud.",
      response.status,
      payload.code,
      payload.details
    );
  }

  return payload.data as T;
}
