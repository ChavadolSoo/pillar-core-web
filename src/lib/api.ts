import "server-only";
import { getAccessToken, getViewer } from "@/lib/session";

/** plc-gateway answered with an error (NestJS `{ statusCode, error, message }`). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The user is not signed in (or Keycloak ended the session). */
export class SignInRequiredError extends ApiError {
  constructor() {
    super(401, "Sign-in required");
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const base = () => (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

async function send<T>(path: string, init: RequestInit & { next?: NextFetchRequestConfig }): Promise<T> {
  const res = await fetch(`${base()}${path}`, init);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: unknown };
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : typeof data.message === "string"
        ? data.message
        : res.statusText;
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Public website content (no token). Cached for a minute so a burst of
 * visitors does not reach plc-portal on every page view.
 */
export function publicGet<T>(path: string, revalidate = 60): Promise<T> {
  return send<T>(`/api/portal/public${path}`, { next: { revalidate, tags: ["portal"] } });
}

export function publicSend<T>(method: Method, path: string, body?: unknown): Promise<T> {
  return send<T>(`/api/portal/public${path}`, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

/** Calls plc-gateway as the signed-in user (server side only). */
export async function userApi<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const [token, viewer] = await Promise.all([getAccessToken(), getViewer()]);
  if (!token) throw new SignInRequiredError();
  return send<T>(path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      // Users in several organizations pick the one they act in.
      ...(viewer?.tenant && viewer.organizations.length > 1 && { "x-tenant-code": viewer.tenant }),
      ...(body !== undefined && { "content-type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

/** Content for a public page: an empty value instead of an error page when the API is down. */
export async function orEmpty<T>(promise: Promise<T>, empty: T): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.error("[api]", (e as Error).message);
    return empty;
  }
}

export const emptyPage = { items: [], total: 0, page: 1, limit: 20 };
