import { useEffect, useMemo, useRef, useState } from "react";
import type { AuditEntry, Incident, Severity } from "../../types/incident";
import type { PanelActionResult } from "../../types/panelAction";
import { mockIncidents } from "../../data/mockIncidents";
import { buildAllAuditTrails } from "../../data/mockAuditTrail";
import { useClock } from "../../hooks/useClock";
import { mitigationClock } from "../../lib/wireFormat";
import { createId } from "../../lib/id";
import { WireHeader } from "./WireHeader";
import { IncidentFeed } from "./IncidentFeed";
import { LoadingState } from "./LoadingState";
import { IncidentDetailPanel } from "./IncidentDetailPanel";

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const CURRENT_USER = "H. SCAIFE";

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
  const [auditTrail, setAuditTrail] = useState<Record<string, AuditEntry[]>>({});
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setIncidents(mockIncidents);
      setAuditTrail(buildAllAuditTrails(mockIncidents));
    }, 420);
    return () => window.clearTimeout(id);
  }, []);

  const sorted = useMemo(() => (incidents ? sortIncidents(incidents, now) : []), [incidents, now]);

  const recordAuditEntry = (id: string, entry: AuditEntry) => {
    setAuditTrail((prev) => ({ ...prev, [id]: [entry, ...(prev[id] ?? [])] }));
  };

  const handleClaim = (id: string) => {
    setIncidents((current) =>
      current
        ? current.map((incident) =>
            incident.id === id
              ? { ...incident, assigneeName: CURRENT_USER, version: incident.version + 1 }
              : incident,
          )
        : current,
    );
    recordAuditEntry(id, {
      id: createId("audit"),
      incidentId: id,
      action: "INCIDENT_UPDATED",
      actorName: CURRENT_USER,
      occurredAt: new Date().toISOString(),
      detail: `Claimed by ${CURRENT_USER}`,
    });
  };

  const findLive = (id: string) => incidents?.find((incident) => incident.id === id);

  const commitUpdate = (updated: Incident, entry: AuditEntry): PanelActionResult => {
    setIncidents((current) => (current ? current.map((incident) => (incident.id === updated.id ? updated : incident)) : current));
    recordAuditEntry(updated.id, entry);
    return { ok: true, incident: updated };
  };

  const handlePanelClaim = (id: string, expectedVersion: number): PanelActionResult => {
    const live = findLive(id);
    if (!live) return { ok: false, kind: "conflict", expected: expectedVersion, current: expectedVersion };
    if (live.version !== expectedVersion) {
      return { ok: false, kind: "conflict", expected: expectedVersion, current: live.version };
    }
    const updated: Incident = { ...live, assigneeName: CURRENT_USER, version: live.version + 1 };
    return commitUpdate(updated, {
      id: createId("audit"),
      incidentId: id,
      action: "INCIDENT_UPDATED",
      actorName: CURRENT_USER,
      occurredAt: new Date().toISOString(),
      detail: `Claimed by ${CURRENT_USER}`,
    });
  };

  const handlePanelUnwind = (id: string, expectedVersion: number): PanelActionResult => {
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
      actorName: CURRENT_USER,
      occurredAt: new Date().toISOString(),
      detail: clearedSummary ? `Cleared: ${clearedSummary}` : undefined,
    });
  };

  const handlePanelResolve = (id: string, expectedVersion: number): PanelActionResult => {
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
      actorName: live.assigneeName ?? live.reporterName,
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

  return (
    <div className="min-h-screen bg-paper">
      <WireHeader />

      {selectedIncidentId && selectedIncident && (
        <IncidentDetailPanel
          key={selectedIncidentId}
          initialIncident={selectedIncident}
          liveIncident={findLive(selectedIncidentId)}
          auditTrail={auditTrail[selectedIncidentId] ?? []}
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
          <LoadingState />
        ) : (
          <IncidentFeed incidents={sorted} now={now} onClaim={handleClaim} onSelect={handleSelect} />
        )}
      </main>
    </div>
  );
}
