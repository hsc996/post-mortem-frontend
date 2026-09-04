import { useEffect, useMemo, useState } from "react";
import type { Incident, Severity } from "../../types/incident";
import { mockIncidents } from "../../data/mockIncidents";
import { useClock } from "../../hooks/useClock";
import { mitigationClock } from "../../lib/wireFormat";
import { WireHeader } from "./WireHeader";
import { IncidentFeed } from "./IncidentFeed";
import { LoadingState } from "./LoadingState";

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

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

  useEffect(() => {
    const id = window.setTimeout(() => setIncidents(mockIncidents), 420);
    return () => window.clearTimeout(id);
  }, []);

  const sorted = useMemo(() => (incidents ? sortIncidents(incidents, now) : []), [incidents, now]);

  const handleClaim = (id: string) => {
    setIncidents((current) =>
      current
        ? current.map((incident) =>
            incident.id === id ? { ...incident, assigneeName: "H. SCAIFE" } : incident,
          )
        : current,
    );
  };

  return (
    <div className="min-h-screen bg-paper">
      <WireHeader />
      <main>{incidents === null ? <LoadingState /> : <IncidentFeed incidents={sorted} now={now} onClaim={handleClaim} />}</main>
    </div>
  );
}
