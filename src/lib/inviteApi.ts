import type { Role } from "../types/user";
import { API_BASE, ApiError, authFetch, parseError } from "./apiClient";

/** Raw backend shapes (src/schemas/invite.py) — snake_case. */
export interface InviteDto {
  id: string;
  email: string;
  role: Role;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  is_expired: boolean;
  is_accepted: boolean;
}

export interface InviteCreateResponseDto {
  id: string;
  email: string;
  role: Role;
  expires_at: string;
  invite_link: string;
}

export interface InvitePreviewDto {
  email: string;
  role: Role;
  expires_at: string;
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) await parseError(response);
  return (await response.json()) as T;
}

export async function createInvite(token: string, email: string, role: Role): Promise<InviteCreateResponseDto> {
  return handle<InviteCreateResponseDto>(
    await authFetch(token, "/auth/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    }),
  );
}

export async function listInvites(token: string): Promise<InviteDto[]> {
  return handle<InviteDto[]>(await authFetch(token, "/auth/invites"));
}

/** Public — no auth token. Lets the invite-accept screen show who/what the invite is for. */
export async function fetchInvitePreview(inviteToken: string): Promise<InvitePreviewDto> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/invites/${inviteToken}`);
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?", 0);
  }
  return handle<InvitePreviewDto>(response);
}

export interface AcceptInviteInput {
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/** Public — no auth token. Creates the account and returns a fresh access token for auto sign-in. */
export async function acceptInvite(inviteToken: string, input: AcceptInviteInput): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/invites/${inviteToken}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: input.password,
        first_name: input.firstName,
        last_name: input.lastName,
        ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
      }),
    });
  } catch {
    throw new ApiError("Can't reach the backend. Is it running?", 0);
  }
  const data = await handle<{ access_token: string }>(response);
  return data.access_token;
}
