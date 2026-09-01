import type { ApiEnvelope, ApiErrorEnvelope } from "../types/Api";

export type TokenGetter = () => Promise<string | null>;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, payload?: ApiErrorEnvelope["error"]) {
    super(payload?.message || "Le service MenuCity est momentanément indisponible.");
    this.name = "ApiError";
    this.code = payload?.code || "api_error";
    this.status = status;
    this.requestId = payload?.requestId;
    this.fields = payload?.fields;
  }
}

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

export const isApiConfigured = Boolean(apiBaseUrl);
export const areMediaUploadsEnabled = process.env.EXPO_PUBLIC_MEDIA_UPLOADS_ENABLED === "true";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  getToken?: TokenGetter;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError(0, {
      code: "api_not_configured",
      message: "EXPO_PUBLIC_API_URL n’est pas configurée.",
      requestId: "local-config",
    });
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.getToken) {
    const token = await options.getToken();
    if (!token) {
      throw new ApiError(401, {
        code: "authentication_required",
        message: "Une connexion est requise.",
        requestId: "client-auth",
      });
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers, body });
  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorEnvelope | null;
  if (!response.ok) {
    throw new ApiError(response.status, payload && "error" in payload ? payload.error : undefined);
  }
  if (!payload || !("data" in payload)) throw new ApiError(response.status);
  return payload.data;
}

export async function uploadMedia(
  path: string,
  file: Blob,
  contentType: "image/jpeg" | "image/png" | "image/webp",
  getToken: TokenGetter,
) {
  if (!areMediaUploadsEnabled) {
    throw new ApiError(503, {
      code: "media_storage_unavailable",
      message: "L’envoi d’images est temporairement désactivé. Utilisez une URL d’image externe.",
      requestId: "client-config",
    });
  }
  if (!apiBaseUrl) throw new ApiError(0);
  const token = await getToken();
  if (!token) throw new ApiError(401);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    body: file,
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<{ url: string; key: string }> | ApiErrorEnvelope | null;
  if (!response.ok) throw new ApiError(response.status, payload && "error" in payload ? payload.error : undefined);
  if (!payload || !("data" in payload)) throw new ApiError(response.status);
  return payload.data;
}
