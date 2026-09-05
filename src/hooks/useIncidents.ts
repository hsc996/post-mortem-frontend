import { useCallback, useEffect, useRef, useState } from "react";
import type { AuditEntry, Incident } from "../types/incident";
import type { CreateIncidentResult, PanelActionResult } from "../types/panelAction";
import * as api from "../lib/incidentsApi";
import { ConflictError } from "../lib/incidentsApi";
import { buildUserMap, mapAuditEntry, mapIncident, mapMitigation, type UserMap } from "../lib/incidentMapper";

function toActionResult(err: unknown): PanelActionResult {
  if (err instanceof ConflictError) {
    return { ok: false, kind: "conflict", expected: err.expected, current: err.current };
  }
  return { ok: false, kind: "blocked", reason: err instanceof Error ? err.message : "Request failed." };
}

/**
 * Owns the real backend's incident data: the list, per-incident mitigation
 * joins, on-demand audit trails, and the three mutating actions (claim,
 * resolve, unwind clear) — each translated into the same ok/conflict/blocked
 * contract the detail panel already understood from its mock-data design.
 */
export function useIncidents(token: string) {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [auditTrail, setAuditTrail] = useState<Record<string, AuditEntry[]>>({});
  const userMapRef = useRef<UserMap>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [userDtos, incidentDtos] = await Promise.all([api.listUsers(token), api.listIncidents(token)]);
        if (cancelled) return;
        const userMap = buildUserMap(userDtos);
        userMapRef.current = userMap;
        const mapped = await Promise.all(
          incidentDtos.map(async (dto) => {
            const mitigationDto = dto.status === "mitigated" ? await api.getMitigation(token, dto.id) : null;
            const mitigation = mitigationDto ? mapMitigation(mitigationDto, userMap) : null;
            return mapIncident(dto, userMap, mitigation);
          }),
        );
        if (cancelled) return;
        setIncidents(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load incidents.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadAttempt]);

  const retry = useCallback(() => {
    setLoadError(null);
    setLoadAttempt((n) => n + 1);
  }, []);

  const patchIncident = useCallback((updated: Incident) => {
    setIncidents((current) => (current ? current.map((inc) => (inc.id === updated.id ? updated : inc)) : current));
  }, []);

  const loadAuditTrail = useCallback(
    async (incidentId: string) => {
      const dtos = await api.fetchAuditLog(token, incidentId);
      // Server returns oldest-first; the wire feed reads newest-first, like the main feed.
      const mapped = dtos
        .map((dto) => mapAuditEntry(dto, userMapRef.current))
        .filter((e): e is AuditEntry => e !== null)
        .reverse();
      setAuditTrail((prev) => ({ ...prev, [incidentId]: mapped }));
    },
    [token],
  );

  const claim = useCallback(
    async (id: string, expectedVersion: number, assigneeId: string): Promise<PanelActionResult> => {
      try {
        const dto = await api.claimIncident(token, id, assigneeId, expectedVersion);
        const existingMitigation = incidents?.find((i) => i.id === id)?.mitigation ?? null;
        const updated = mapIncident(dto, userMapRef.current, existingMitigation);
        patchIncident(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, incidents, patchIncident, loadAuditTrail],
  );

  const resolve = useCallback(
    async (id: string): Promise<PanelActionResult> => {
      try {
        const dto = await api.resolveIncident(token, id);
        const updated = mapIncident(dto, userMapRef.current, null);
        patchIncident(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, patchIncident, loadAuditTrail],
  );

  /**
   * A real server re-fetch, not a read of local state — the local `incidents`
   * cache only learns about changes this client itself made. Reloading after
   * a conflict must see what another actor did, which local state can't show.
   */
  const refreshIncident = useCallback(
    async (id: string): Promise<Incident | null> => {
      try {
        const dto = await api.getIncident(token, id);
        const mitigationDto = dto.status === "mitigated" ? await api.getMitigation(token, id) : null;
        const mitigation = mitigationDto ? mapMitigation(mitigationDto, userMapRef.current) : null;
        const updated = mapIncident(dto, userMapRef.current, mitigation);
        patchIncident(updated);
        return updated;
      } catch {
        return null;
      }
    },
    [token, patchIncident],
  );

  const createIncident = useCallback(
    async (input: api.IncidentCreateInput): Promise<CreateIncidentResult> => {
      try {
        const dto = await api.createIncident(token, input);
        const created = mapIncident(dto, userMapRef.current, null);
        setIncidents((current) => (current ? [created, ...current] : [created]));
        return { ok: true, incident: created };
      } catch (err) {
        return { ok: false, reason: err instanceof Error ? err.message : "Request failed." };
      }
    },
    [token],
  );

  const applyMitigation = useCallback(
    async (id: string, summary: string, ttlMinutes: number): Promise<PanelActionResult> => {
      try {
        const mitigationDto = await api.createMitigation(token, id, { summary, ttlMinutes });
        const mitigation = mapMitigation(mitigationDto, userMapRef.current);
        const dto = await api.getIncident(token, id);
        const updated = mapIncident(dto, userMapRef.current, mitigation);
        patchIncident(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, patchIncident, loadAuditTrail],
  );

  const unwind = useCallback(
    async (id: string): Promise<PanelActionResult> => {
      try {
        await api.clearMitigation(token, id);
        const dto = await api.getIncident(token, id);
        const updated = mapIncident(dto, userMapRef.current, null);
        patchIncident(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, patchIncident, loadAuditTrail],
  );

  return {
    incidents,
    loadError,
    retry,
    auditTrail,
    loadAuditTrail,
    claim,
    resolve,
    unwind,
    refreshIncident,
    createIncident,
    applyMitigation,
  };
}
