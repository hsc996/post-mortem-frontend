export const API_BASE = "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
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
    throw new ApiError("Too many attempts. Wait a moment before trying again.", 429);
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
