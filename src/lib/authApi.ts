import type { AuthUser } from "../types/user";

const API_BASE = "http://localhost:8000/api/v1";

export class ApiError extends Error {}

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

async function parseError(response: Response): Promise<never> {
  if (response.status === 429) {
    throw new ApiError("Too many attempts. Wait a moment before trying again.");
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  throw new ApiError(extractDetail(body, `Request failed (${response.status}).`));
}

function toAuthUser(u: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role as AuthUser["role"],
    isActive: u.is_active,
  };
}

export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username: email, password });
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?");
  }
  if (!response.ok) await parseError(response);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function register(input: RegisterInput): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        first_name: input.firstName,
        last_name: input.lastName,
      }),
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?");
  }
  if (!response.ok) await parseError(response);
}

export async function fetchMe(token: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?");
  }
  if (!response.ok) await parseError(response);
  return toAuthUser(await response.json());
}

export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Best-effort server-side revoke; the client clears its own token regardless.
  }
}
