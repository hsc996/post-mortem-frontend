import { useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import type { Incident, Severity } from "../../types/incident";
import type { AuthUser } from "../../types/user";
import { canMutate, toCurrentUser } from "../../types/user";
import { useClock } from "../../hooks/useClock";
import { useIncidents } from "../../hooks/useIncidents";
import { mitigationClock } from "../../lib/wireFormat";
import { WireHeader } from "./WireHeader";
import { IncidentFeed } from "./IncidentFeed";
import { LoadingState, type SkeletonSpec } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { IncidentDetailPanel } from "./IncidentDetailPanel";

const LOADING_SKELETON_SPECS: SkeletonSpec[] = [
  { hasMitigation: false, actionRowKind: "button" },
  { hasMitigation: true, actionRowKind: "badge" },
  { hasMitigation: true, actionRowKind: "badge" },
  { hasMitigation: false, actionRowKind: "button" },
  { hasMitigation: false, actionRowKind: "none" },
  { hasMitigation: false, actionRowKind: "none" },
];

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

interface IncidentDeskProps {
  currentUser: AuthUser;
  token: string;
  onSignOut: () => void;
}

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

export function IncidentDesk({ currentUser: authUser, token, onSignOut }: IncidentDeskProps) {
  const now = useClock();
  const currentUser = toCurrentUser(authUser);
  const { incidents, loadError, retry, auditTrail, loadAuditTrail, claim, resolve, unwind, refreshIncident } =
    useIncidents(token);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const sorted = useMemo(() => (incidents ? sortIncidents(incidents, now) : []), [incidents, now]);

  const findLive = (id: string) => incidents?.find((incident) => incident.id === id);

  const handleClaim = (id: string) => {
    if (!canMutate(currentUser.role)) return;
    const live = findLive(id);
    if (!live) return;
    void claim(id, live.version, authUser.id);
  };

  const handlePanelClaim = (id: string, expectedVersion: number) => claim(id, expectedVersion, authUser.id);
  const handlePanelResolve = (id: string) => resolve(id);
  const handlePanelUnwind = (id: string) => unwind(id);

  const handleSelect = (id: string, opener: HTMLElement) => {
    openerRef.current = opener;
    setSelectedIncidentId(id);
    setPanelOpen(true);
    void loadAuditTrail(id);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    openerRef.current?.focus();
  };

  const selectedIncident = selectedIncidentId ? findLive(selectedIncidentId) : undefined;

  const acting = canMutate(currentUser.role);

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-paper">
      <WireHeader currentUser={currentUser} onSignOut={onSignOut} />

      {selectedIncidentId && selectedIncident && (
        <IncidentDetailPanel
          key={selectedIncidentId}
          initialIncident={selectedIncident}
          auditTrail={auditTrail[selectedIncidentId] ?? []}
          canAct={acting}
          isOpen={panelOpen}
          onClose={handleClosePanel}
          onClaim={handlePanelClaim}
          onResolve={handlePanelResolve}
          onUnwind={handlePanelUnwind}
          onReload={refreshIncident}
        />
      )}

      <main
        className={`transition-[padding] duration-300 ${panelOpen ? "sm:pr-[28rem] md:pr-[32rem]" : ""}`}
      >
        {incidents === null ? (
          loadError ? (
            <ErrorState message={loadError} onRetry={retry} />
          ) : (
            <LoadingState specs={LOADING_SKELETON_SPECS} />
          )
        ) : (
          <IncidentFeed incidents={sorted} now={now} canAct={acting} onClaim={handleClaim} onSelect={handleSelect} />
        )}
      </main>
    </div>
    </MotionConfig>
  );
}
