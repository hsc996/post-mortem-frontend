import { useCallback, useEffect, useState } from "react";
import type { Role } from "../types/user";
import * as api from "../lib/incidentsApi";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

function wireName(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}. ${lastName.toUpperCase()}`;
}

/** Only meaningful for an admin caller — GET /auth/users returns the full shape only to admins. */
function toDirectoryUser(dto: api.UserDto): DirectoryUser | null {
  if (!dto.email || !dto.role || dto.is_active === undefined) return null;
  return {
    id: dto.id,
    name: wireName(dto.first_name, dto.last_name),
    email: dto.email,
    role: dto.role as Role,
    isActive: dto.is_active,
  };
}

/** Powers the admin role-management screen. Only call this for an admin session. */
export function useUsers(token: string) {
  const [users, setUsers] = useState<DirectoryUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dtos = await api.listUsers(token);
        if (cancelled) return;
        setUsers(dtos.map(toDirectoryUser).filter((u): u is DirectoryUser => u !== null));
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load users.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadAttempt]);

  const reload = useCallback(() => setLoadAttempt((n) => n + 1), []);

  const updateRole = useCallback(
    async (userId: string, role: Role): Promise<{ ok: true } | { ok: false; reason: string }> => {
      try {
        const dto = await api.updateUserRole(token, userId, role);
        const updated = toDirectoryUser(dto);
        if (updated) {
          setUsers((current) => (current ? current.map((u) => (u.id === userId ? updated : u)) : current));
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: err instanceof Error ? err.message : "Request failed." };
      }
    },
    [token],
  );

  return { users, loadError, reload, updateRole };
}
