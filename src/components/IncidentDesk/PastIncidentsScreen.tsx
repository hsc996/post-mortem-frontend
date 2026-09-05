import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { AuditEntry, Incident } from "../../types/incident";
import type { PanelActionResult } from "../../types/panelAction";
import type { IncidentEditInput } from "../../lib/incidentsApi";
import { feedContainerVariants } from "../../lib/motionVariants";
import { IncidentBulletin } from "./IncidentBulletin";
import { IncidentDetailPanel } from "./IncidentDetailPanel";

interface PastIncidentsScreenProps {
  now: Date;
  canAct: boolean;
  resolvedIncidents: Incident[];
  resolvedPage: number;
  resolvedHasMore: boolean;
  resolvedHasPrev: boolean;
  resolvedLoading: boolean;
  onPageChange: (direction: "next" | "prev") => void;
  auditTrail: Record<string, AuditEntry[]>;
  loadAuditTrail: (id: string) => Promise<void>;
  onClaim: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onResolve: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onUnwind: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onApplyMitigation: (id: string, summary: string, ttlMinutes: number) => Promise<PanelActionResult>;
  onEdit: (id: string, expectedVersion: number, input: IncidentEditInput) => Promise<PanelActionResult>;
  onReload: (id: string) => Promise<Incident | null>;
  onBack: () => void;
}

/**
 * Resolved incidents are history to review, not a triage queue — its own
 * page (matching AdminUsersScreen/GlobalAuditLogScreen's pattern) with real
 * paged navigation, reachable from "VIEW PAST INCIDENTS" next to filing a
 * new one. Still opens the real detail panel per row, since reviewing a
 * past incident's full account is the actual point of a postmortem tool.
 */
export function PastIncidentsScreen({
  now,
  canAct,
  resolvedIncidents,
  resolvedPage,
  resolvedHasMore,
  resolvedHasPrev,
  resolvedLoading,
  onPageChange,
  auditTrail,
  loadAuditTrail,
  onClaim,
  onResolve,
  onUnwind,
  onApplyMitigation,
  onEdit,
  onReload,
  onBack,
}: PastIncidentsScreenProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

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

  const selectedIncident = selectedIncidentId
    ? resolvedIncidents.find((incident) => incident.id === selectedIncidentId)
    : undefined;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b-4 border-double border-steel bg-paper px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
          <div>
            <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
              PAST INCIDENTS
            </p>
            <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">RESOLVED — HISTORY</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
          >
            BACK TO WIRE
          </button>
        </div>
      </header>

      {selectedIncidentId && selectedIncident && (
        <IncidentDetailPanel
          key={selectedIncidentId}
          initialIncident={selectedIncident}
          auditTrail={auditTrail[selectedIncidentId] ?? []}
          canAct={canAct}
          isOpen={panelOpen}
          onClose={handleClosePanel}
          onClaim={onClaim}
          onResolve={onResolve}
          onUnwind={onUnwind}
          onApplyMitigation={onApplyMitigation}
          onEdit={onEdit}
          onReload={onReload}
        />
      )}

      <main className={`transition-[padding] duration-300 ${panelOpen ? "sm:pr-[28rem] md:pr-[32rem]" : ""}`}>
        {resolvedIncidents.length === 0 ? (
          <p className="mx-auto max-w-4xl px-5 py-6 text-sm text-ink-dim sm:px-8">No resolved incidents yet.</p>
        ) : (
          <motion.div initial="hidden" animate="show" variants={feedContainerVariants}>
            {resolvedIncidents.map((incident) => (
              <IncidentBulletin
                key={incident.id}
                incident={incident}
                now={now}
                canAct={canAct}
                onClaim={() => {}}
                onSelect={handleSelect}
              />
            ))}
          </motion.div>
        )}

        <div className="mx-auto flex max-w-4xl items-center justify-center gap-4 px-5 py-6 sm:px-8">
          <button
            type="button"
            onClick={() => onPageChange("prev")}
            disabled={!resolvedHasPrev || resolvedLoading}
            className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:pointer-events-none disabled:opacity-40"
          >
            PREV
          </button>
          <span className="text-xs tabular-nums tracking-[0.1em] text-ink-dim">PAGE {resolvedPage}</span>
          <button
            type="button"
            onClick={() => onPageChange("next")}
            disabled={!resolvedHasMore || resolvedLoading}
            className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:pointer-events-none disabled:opacity-40"
          >
            NEXT
          </button>
        </div>
      </main>
    </div>
  );
}
