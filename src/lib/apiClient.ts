/** VITE_API_URL is the bare backend origin (no path) — the /api/v1 prefix is this app's own concern. */
export const API_BASE = `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/v1`;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** 429s carry a client-side countdown hint — the backend gives no Retry-After header, but every limiter here is "N per 1 minute". */
export class RateLimitError extends ApiError {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message, 429);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * Registered once by useAuth so any 401 anywhere in the app — not just the
 * initial session check — signs the user out instead of surfacing as a
 * confusing generic error on whatever action triggered it.
 */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** FastAPI errors are either a plain string detail or a list of pydantic validation errors. */
function extractDetail(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e) => (e && typeof e === "object" && "msg" in e ? String((e as { msg: unknown }).msg) : String(e)))
        .join("; ");
    }
  }
  return fallback;
}

export async function parseError(response: Response): Promise<never> {
  if (response.status === 429) {
    throw new RateLimitError(
      `Too many attempts. Try again in about ${RATE_LIMIT_WINDOW_SECONDS} seconds.`,
      RATE_LIMIT_WINDOW_SECONDS,
    );
  }
  if (response.status === 401) {
    onUnauthorized?.();
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  throw new ApiError(extractDetail(body, `Request failed (${response.status}).`), response.status);
}

export async function authFetch(token: string, path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?", 0);
  }
}
