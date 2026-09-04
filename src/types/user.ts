export type Role = "admin" | "responder" | "viewer";

export interface CurrentUser {
  name: string;
  role: Role;
}

/** Mirrors the real backend's RequireRole([ADMIN, RESPONDER]) gate on every mutating route. */
export const canMutate = (role: Role): boolean => role !== "viewer";
