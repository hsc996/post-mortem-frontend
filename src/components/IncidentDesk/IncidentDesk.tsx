import { useEffect, useMemo, useRef, useState } from "react";
import type { AuditEntry, Incident, Severity } from "../../types/incident";
import type { PanelActionResult } from "../../types/panelAction";
import type { CurrentUser, Role } from "../../types/user";
import { canMutate } from "../../types/user";
import { mockIncidents, fetchIncidents } from "../../data/mockIncidents";
import { buildAllAuditTrails } from "../../data/mockAuditTrail";
import { useClock } from "../../hooks/useClock";
import { mitigationClock } from "../../lib/wireFormat";
import { createId } from "../../lib/id";
import { WireHeader } from "./WireHeader";
import { IncidentFeed } from "./IncidentFeed";
import { LoadingState, type SkeletonSpec } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { IncidentDetailPanel } from "./IncidentDetailPanel";

const SKELETON_SPECS: SkeletonSpec[] = mockIncidents.map((incident) => ({
  hasMitigation: !!incident.mitigation,
  actionRowKind: incident.status === "resolved" ? "none" : incident.assigneeName ? "badge" : "button",
}));

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const ROLE_CYCLE: Role[] = ["responder", "admin", "viewer"];
const PERMISSION_DENIED = "Operation not permitted for current user role.";

function sortIncidents(incidents: Incident[], now: Date): Incident[] {
  const tier = (incident: Incident) => {
    if (incident.status === "resolved") return 2;
    if (incident.mitigation && mitigationClock(incident.mitigation.appliedAt, incident.mitigation.ttlMinutes, now).isExpired) {
      return 0;
    }
    return 1;
  };

  return [...incidents].sort((a, b) => {
    const tierDiff = tier(a) - tier(b);
    if (tierDiff !== 0) return tierDiff;
    if (tier(a) === 2) {
      return new Date(b.resolvedAt ?? b.createdAt).getTime() - new Date(a.resolvedAt ?? a.createdAt).getTime();
    }
    const severityDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function IncidentDesk() {
  const now = useClock();
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [auditTrail, setAuditTrail] = useState<Record<string, AuditEntry[]>>({});
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ name: "H. SCAIFE", role: "responder" });
  const openerRef = useRef<HTMLElement | null>(null);

  const handleCycleRole = () => {
    setCurrentUser((user) => {
      const next = ROLE_CYCLE[(ROLE_CYCLE.indexOf(user.role) + 1) % ROLE_CYCLE.length];
      return { ...user, role: next };
    });
  };

  useEffect(() => {
    let cancelled = false;
    fetchIncidents()
      .then((data) => {
        if (cancelled) return;
        setIncidents(data);
        setAuditTrail(buildAllAuditTrails(data));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load incidents.");
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const handleRetry = () => {
    setLoadError(null);
    setLoadAttempt((n) => n + 1);
  };

  const sorted = useMemo(() => (incidents ? sortIncidents(incidents, now) : []), [incidents, now]);

  const recordAuditEntry = (id: string, entry: AuditEntry) => {
    setAuditTrail((prev) => ({ ...prev, [id]: [entry, ...(prev[id] ?? [])] }));
  };

  const handleClaim = (id: string) => {
    if (!canMutate(currentUser.role)) return;
    setIncidents((current) =>
      current
        ? current.map((incident) =>
            incident.id === id
              ? { ...incident, assigneeName: currentUser.name, version: incident.version + 1 }
              : incident,
          )
        : current,
    );
    recordAuditEntry(id, {
      id: createId("audit"),
      incidentId: id,
      action: "INCIDENT_UPDATED",
      actorName: currentUser.name,
      occurredAt: new Date().toISOString(),
      detail: `Claimed by ${currentUser.name}`,
    });
  };

  const findLive = (id: string) => incidents?.find((incident) => incident.id === id);

  const commitUpdate = (updated: Incident, entry: AuditEntry): PanelActionResult => {
    setIncidents((current) => (current ? current.map((incident) => (incident.id === updated.id ? updated : incident)) : current));
    recordAuditEntry(updated.id, entry);
    return { ok: true, incident: updated };
  };

  const handlePanelClaim = (id: string, expectedVersion: number): PanelActionResult => {
    if (!canMutate(currentUser.role)) return { ok: false, kind: "blocked", reason: PERMISSION_DENIED };
    const live = findLive(id);
    if (!live) return { ok: false, kind: "conflict", expected: expectedVersion, current: expectedVersion };
    if (live.version !== expectedVersion) {
      return { ok: false, kind: "conflict", expected: expectedVersion, current: live.version };
    }
    const updated: Incident = { ...live, assigneeName: currentUser.name, version: live.version + 1 };
    return commitUpdate(updated, {
      id: createId("audit"),
      incidentId: id,
      action: "INCIDENT_UPDATED",
      actorName: currentUser.name,
      occurredAt: new Date().toISOString(),
      detail: `Claimed by ${currentUser.name}`,
    });
  };

  const handlePanelUnwind = (id: string, expectedVersion: number): PanelActionResult => {
    if (!canMutate(currentUser.role)) return { ok: false, kind: "blocked", reason: PERMISSION_DENIED };
    const live = findLive(id);
    if (!live) return { ok: false, kind: "conflict", expected: expectedVersion, current: expectedVersion };
    if (live.version !== expectedVersion) {
      return { ok: false, kind: "conflict", expected: expectedVersion, current: live.version };
    }
    const clearedSummary = live.mitigation?.summary;
    const updated: Incident = {
      ...live,
      mitigation: null,
      status: live.status === "mitigated" ? "open" : live.status,
      version: live.version + 1,
    };
    return commitUpdate(updated, {
      id: createId("audit"),
      incidentId: id,
      action: "MITIGATION_DELETED",
      actorName: currentUser.name,
      occurredAt: new Date().toISOString(),
      detail: clearedSummary ? `Cleared: ${clearedSummary}` : undefined,
    });
  };

  const handlePanelResolve = (id: string, expectedVersion: number): PanelActionResult => {
    if (!canMutate(currentUser.role)) return { ok: false, kind: "blocked", reason: PERMISSION_DENIED };
    const live = findLive(id);
    if (!live) return { ok: false, kind: "conflict", expected: expectedVersion, current: expectedVersion };
    if (live.version !== expectedVersion) {
      return { ok: false, kind: "conflict", expected: expectedVersion, current: live.version };
    }
    if (live.mitigation) {
      return {
        ok: false,
        kind: "blocked",
        reason:
          "Cannot resolve an incident with an active mitigation. Clear the mitigation first via DELETE /incidents/{incident_id}/mitigation.",
      };
    }
    const resolvedAt = new Date().toISOString();
    const updated: Incident = { ...live, status: "resolved", resolvedAt, version: live.version + 1 };
    return commitUpdate(updated, {
      id: createId("audit"),
      incidentId: id,
      action: "INCIDENT_RESOLVED",
      actorName: currentUser.name,
      occurredAt: resolvedAt,
      detail: "Marked resolved",
    });
  };

  const handleSelect = (id: string, opener: HTMLElement) => {
    openerRef.current = opener;
    setSelectedIncidentId(id);
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    openerRef.current?.focus();
  };

  const selectedIncident = selectedIncidentId ? findLive(selectedIncidentId) : undefined;

  const acting = canMutate(currentUser.role);

  return (
    <div className="min-h-screen bg-paper">
      <WireHeader currentUser={currentUser} onCycleRole={handleCycleRole} />

      {selectedIncidentId && selectedIncident && (
        <IncidentDetailPanel
          key={selectedIncidentId}
          initialIncident={selectedIncident}
          liveIncident={findLive(selectedIncidentId)}
          auditTrail={auditTrail[selectedIncidentId] ?? []}
          canAct={acting}
          isOpen={panelOpen}
          onClose={handleClosePanel}
          onClaim={handlePanelClaim}
          onResolve={handlePanelResolve}
          onUnwind={handlePanelUnwind}
        />
      )}

      <main
        className={`transition-[padding] duration-300 ${panelOpen ? "sm:pr-[28rem] md:pr-[32rem]" : ""}`}
      >
        {incidents === null ? (
          loadError ? (
            <ErrorState message={loadError} onRetry={handleRetry} />
          ) : (
            <LoadingState specs={SKELETON_SPECS} />
          )
        ) : (
          <IncidentFeed incidents={sorted} now={now} canAct={acting} onClaim={handleClaim} onSelect={handleSelect} />
        )}
      </main>
    </div>
  );
}
