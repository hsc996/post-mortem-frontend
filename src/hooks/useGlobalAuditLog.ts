import { useCallback, useEffect, useState } from "react";
import type { GlobalAuditEntry } from "../types/incident";
import * as api from "../lib/incidentsApi";
import { buildUserMap, mapGlobalAuditEntry } from "../lib/incidentMapper";

/** Powers the admin global audit-log screen. GET /audit-logs/ allows ADMIN or RESPONDER; only call this for one of those sessions. */
export function useGlobalAuditLog(token: string) {
  const [entries, setEntries] = useState<GlobalAuditEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [userDtos, auditDtos] = await Promise.all([api.listUsers(token), api.fetchGlobalAuditLog(token)]);
        if (cancelled) return;
        const userMap = buildUserMap(userDtos);
        setEntries(auditDtos.map((dto) => mapGlobalAuditEntry(dto, userMap)));
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load audit log.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadAttempt]);

  const reload = useCallback(() => setLoadAttempt((n) => n + 1), []);

  return { entries, loadError, reload };
}
