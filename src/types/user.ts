export type Role = "admin" | "responder" | "viewer";

/** The real backend's UserResponse shape (src/schemas/auth.py). */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

export interface CurrentUser {
  name: string;
  role: Role;
}

/** "H. SCAIFE" — matches the wire-desk's existing actor-name convention. */
export const wireName = (user: AuthUser): string =>
  `${user.firstName.charAt(0).toUpperCase()}. ${user.lastName.toUpperCase()}`;

export const toCurrentUser = (user: AuthUser): CurrentUser => ({
  name: wireName(user),
  role: user.role,
});

/** Mirrors the real backend's RequireRole([ADMIN, RESPONDER]) gate on every mutating route. */
export const canMutate = (role: Role): boolean => role !== "viewer";
``