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

export interface DirectoryEntry {
  id: string;
  name: string;
}

/**
 * Active (open/mitigated) incidents are the small, in-flight queue the
 * urgency-tiered sort exists for — fetched in full, not paginated, since a
 * real incident-response tool shouldn't have hundreds open simultaneously.
 * Resolved incidents are historical browsing, not triage, so they get real
 * paged navigation instead.
 */
const RESOLVED_PAGE_SIZE = 10;

async function mapIncidentDtos(token: string, dtos: api.IncidentDto[], userMap: UserMap): Promise<Incident[]> {
  return Promise.all(
    dtos.map(async (dto) => {
      const mitigationDto = dto.status === "mitigated" ? await api.getMitigation(token, dto.id) : null;
      const mitigation = mitigationDto ? mapMitigation(mitigationDto, userMap) : null;
      return mapIncident(dto, userMap, mitigation);
    }),
  );
}

/**
 * Owns the real backend's incident data: the active queue, per-incident
 * mitigation joins, on-demand audit trails, paged resolved-incident history,
 * and the mutating actions — each translated into the same ok/conflict/blocked
 * contract the detail panel already understood from its mock-data design.
 */
export function useIncidents(token: string) {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [resolvedIncidents, setResolvedIncidents] = useState<Incident[]>([]);
  const [resolvedSkip, setResolvedSkip] = useState(0);
  const [resolvedHasMore, setResolvedHasMore] = useState(false);
  const [resolvedLoading, setResolvedLoading] = useState(false);
  const [users, setUsers] = useState<DirectoryEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [auditTrail, setAuditTrail] = useState<Record<string, AuditEntry[]>>({});
  const userMapRef = useRef<UserMap>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [userDtos, openDtos, mitigatedDtos, resolvedDtos] = await Promise.all([
          api.listUsers(token),
          api.listIncidents(token, { status: "open", limit: 100 }),
          api.listIncidents(token, { status: "mitigated", limit: 100 }),
          api.listIncidents(token, { status: "resolved", skip: 0, limit: RESOLVED_PAGE_SIZE }),
        ]);
        if (cancelled) return;
        const userMap = buildUserMap(userDtos);
        userMapRef.current = userMap;
        setUsers(userDtos.map((u) => ({ id: u.id, name: userMap.get(u.id) ?? "UNKNOWN" })));
        const [activeMapped, resolvedMapped] = await Promise.all([
          mapIncidentDtos(token, [...openDtos, ...mitigatedDtos], userMap),
          mapIncidentDtos(token, resolvedDtos, userMap),
        ]);
        if (cancelled) return;
        setIncidents(activeMapped);
        setResolvedIncidents(resolvedMapped);
        setResolvedSkip(0);
        setResolvedHasMore(resolvedDtos.length === RESOLVED_PAGE_SIZE);
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

  const goToResolvedPage = useCallback(
    async (direction: "next" | "prev") => {
      if (resolvedLoading) return;
      if (direction === "next" && !resolvedHasMore) return;
      if (direction === "prev" && resolvedSkip === 0) return;
      const newSkip = direction === "next" ? resolvedSkip + RESOLVED_PAGE_SIZE : resolvedSkip - RESOLVED_PAGE_SIZE;
      setResolvedLoading(true);
      try {
        const dtos = await api.listIncidents(token, { status: "resolved", skip: newSkip, limit: RESOLVED_PAGE_SIZE });
        const mapped = await mapIncidentDtos(token, dtos, userMapRef.current);
        setResolvedIncidents(mapped);
        setResolvedSkip(newSkip);
        setResolvedHasMore(dtos.length === RESOLVED_PAGE_SIZE);
      } catch {
        // Leave pagination state as-is — a transient failure shouldn't strand the view.
      } finally {
        setResolvedLoading(false);
      }
    },
    [token, resolvedSkip, resolvedHasMore, resolvedLoading],
  );

  const patchIncident = useCallback((updated: Incident) => {
    setIncidents((current) => (current ? current.map((inc) => (inc.id === updated.id ? updated : inc)) : current));
  }, []);

  /** Edits never change status, so the updated incident could be sitting in either
   * list — patch whichever one actually has it; mapping over the other is a no-op. */
  const patchAny = useCallback((updated: Incident) => {
    setIncidents((current) => (current ? current.map((inc) => (inc.id === updated.id ? updated : inc)) : current));
    setResolvedIncidents((current) => current.map((inc) => (inc.id === updated.id ? updated : inc)));
  }, []);

  /** A resolve moves an incident out of the active queue — only reflect it in the currently-viewed resolved page when that's page one, so a background resolve elsewhere doesn't corrupt whatever page the user is actually looking at. */
  const moveToResolved = useCallback(
    (updated: Incident) => {
      setIncidents((current) => (current ? current.filter((inc) => inc.id !== updated.id) : current));
      setResolvedSkip((skip) => {
        if (skip === 0) {
          setResolvedIncidents((current) => [updated, ...current].slice(0, RESOLVED_PAGE_SIZE));
        }
        return skip;
      });
    },
    [],
  );

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
        moveToResolved(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, moveToResolved, loadAuditTrail],
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
        if (dto.status === "resolved") {
          moveToResolved(updated);
        } else {
          patchIncident(updated);
        }
        return updated;
      } catch {
        return null;
      }
    },
    [token, patchIncident, moveToResolved],
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

  const edit = useCallback(
    async (id: string, expectedVersion: number, input: api.IncidentEditInput): Promise<PanelActionResult> => {
      try {
        const dto = await api.editIncident(token, id, input, expectedVersion);
        const existingMitigation =
          incidents?.find((i) => i.id === id)?.mitigation ??
          resolvedIncidents.find((i) => i.id === id)?.mitigation ??
          null;
        const updated = mapIncident(dto, userMapRef.current, existingMitigation);
        patchAny(updated);
        void loadAuditTrail(id);
        return { ok: true, incident: updated };
      } catch (err) {
        return toActionResult(err);
      }
    },
    [token, incidents, resolvedIncidents, patchAny, loadAuditTrail],
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
    resolvedIncidents,
    resolvedPage: resolvedSkip / RESOLVED_PAGE_SIZE + 1,
    resolvedHasMore,
    resolvedHasPrev: resolvedSkip > 0,
    resolvedLoading,
    goToResolvedPage,
    users,
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
    edit,
  };
}
