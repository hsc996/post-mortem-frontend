import type { AuthUser } from "../types/user";
import { API_BASE, ApiError, authFetch, parseError } from "./apiClient";

export { ApiError };

function toAuthUser(u: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  account_name: string;
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    role: u.role as AuthUser["role"],
    isActive: u.is_active,
    accountName: u.account_name,
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
    throw new ApiError("Can't reach the backend. Is it running?", 0);
  }
  if (!response.ok) await parseError(response);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export interface RegisterInput {
  accountName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/** Public: self-registration always creates a brand-new isolated account with
 * the registrant as its founding admin. Returns the access token directly for
 * auto sign-in, same as accepting an invite already does. */
export async function register(input: RegisterInput): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_name: input.accountName,
        email: input.email,
        password: input.password,
        first_name: input.firstName,
        last_name: input.lastName,
        ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
      }),
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?", 0);
  }
  if (!response.ok) await parseError(response);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await authFetch(token, "/auth/me");
  if (!response.ok) await parseError(response);
  return toAuthUser(await response.json());
}

export async function logout(token: string): Promise<void> {
  try {
    await authFetch(token, "/auth/logout", { method: "POST" });
  } catch {
    // Best-effort server-side revoke; the client clears its own token regardless.
  }
}
