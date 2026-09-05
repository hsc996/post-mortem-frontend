import { useCallback, useEffect, useState } from "react";
import type { Role } from "../types/user";
import * as api from "../lib/inviteApi";

export interface Invite {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  acceptedAt: string | null;
  isExpired: boolean;
  isAccepted: boolean;
}

function toInvite(dto: api.InviteDto): Invite {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role,
    expiresAt: dto.expires_at,
    acceptedAt: dto.accepted_at,
    isExpired: dto.is_expired,
    isAccepted: dto.is_accepted,
  };
}

/** Powers the admin "invite user" panel and pending-invites list. Only call this for an admin session. */
export function useInvites(token: string) {
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dtos = await api.listInvites(token);
        if (cancelled) return;
        setInvites(dtos.map(toInvite));
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load invites.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadAttempt]);

  const reload = useCallback(() => setLoadAttempt((n) => n + 1), []);

  const sendInvite = useCallback(
    async (email: string, role: Role): Promise<{ ok: true; inviteLink: string } | { ok: false; reason: string }> => {
      try {
        const dto = await api.createInvite(token, email, role);
        reload();
        return { ok: true, inviteLink: dto.invite_link };
      } catch (err) {
        return { ok: false, reason: err instanceof Error ? err.message : "Request failed." };
      }
    },
    [token, reload],
  );

  return { invites, loadError, reload, sendInvite };
}
