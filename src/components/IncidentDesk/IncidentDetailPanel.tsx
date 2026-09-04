import { useEffect, useId, useRef, useState } from "react";
import type { AuditEntry, Incident } from "../../types/incident";
import type { PanelActionResult } from "../../types/panelAction";
import { useClock } from "../../hooks/useClock";
import { PrecedenceStamp } from "./PrecedenceStamp";
import { StatusTag } from "./StatusTag";
import { MitigationReadout } from "./MitigationReadout";
import { PanelActionRow } from "./PanelActionRow";
import { ConflictNotice } from "./ConflictNotice";
import { AuditTrailFeed } from "./AuditTrailFeed";

interface IncidentDetailPanelProps {
  initialIncident: Incident;
  liveIncident: Incident | undefined;
  auditTrail: AuditEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClaim: (id: string, expectedVersion: number) => PanelActionResult;
  onResolve: (id: string, expectedVersion: number) => PanelActionResult;
  onUnwind: (id: string, expectedVersion: number) => PanelActionResult;
}

/**
 * A case file pulled from the same spool — attached to the row that opened
 * it, not a modal. The feed behind it stays live and interactive, which is
 * exactly what makes the version-conflict state below reachable for real:
 * act on this same incident from its row while this snapshot sits open,
 * and the next action taken here will find itself stale.
 */
export function IncidentDetailPanel({
  initialIncident,
  liveIncident,
  auditTrail,
  isOpen,
  onClose,
  onClaim,
  onResolve,
  onUnwind,
}: IncidentDetailPanelProps) {
  const now = useClock();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Frozen at mount (per incident, via the parent's key={id}) — never
  // re-synced from props. This is what lets the snapshot go stale.
  const [snapshot, setSnapshot] = useState(initialIncident);
  const [conflict, setConflict] = useState<{ expected: number; current: number } | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const dispatch = (action: (id: string, version: number) => PanelActionResult, successText: string) => {
    const result = action(snapshot.id, snapshot.version);
    if (!result.ok) {
      setSuccessMessage(null);
      if (result.kind === "conflict") {
        setConflict({ expected: result.expected, current: result.current });
        setBlockedReason(null);
      } else {
        setBlockedReason(result.reason);
        setConflict(null);
      }
      return;
    }
    setSnapshot(result.incident);
    setConflict(null);
    setBlockedReason(null);
    setSuccessMessage(successText);
  };

  const handleReload = () => {
    if (!liveIncident) return;
    setSnapshot(liveIncident);
    setConflict(null);
    setBlockedReason(null);
    setSuccessMessage(null);
  };

  return (
    <aside
      role="dialog"
      aria-labelledby={titleId}
      inert={!isOpen}
      className={`fixed inset-x-0 bottom-0 top-auto z-40 flex max-h-[85vh] w-full flex-col border-t border-rule bg-paper-raised transition-transform duration-300 sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:top-0 sm:max-h-none sm:w-full sm:max-w-md sm:border-l sm:border-t-0 md:max-w-lg ${
        isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-rule px-5 py-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <PrecedenceStamp severity={snapshot.severity} />
            <span className="text-xs text-ink-dim">{snapshot.serviceName}</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusTag status={snapshot.status} />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close incident detail"
              className="text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <h2 id={titleId} className="font-wire text-lg text-ink">
            {snapshot.title}
          </h2>
          <p className="text-sm text-ink-dim">{snapshot.description}</p>

          {snapshot.mitigation && <MitigationReadout mitigation={snapshot.mitigation} now={now} />}

          {conflict ? (
            <ConflictNotice expected={conflict.expected} current={conflict.current} onReload={handleReload} />
          ) : (
            <PanelActionRow
              incident={snapshot}
              onClaim={() => dispatch(onClaim, "Claimed.")}
              onResolve={() => dispatch(onResolve, "Resolved.")}
              onUnwind={() => dispatch(onUnwind, "Mitigation cleared.")}
              blockedReason={blockedReason}
              successMessage={successMessage}
            />
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-rule px-5 py-4">
          <h3 className="text-xs font-semibold tracking-[0.15em] text-ink-dim">AUDIT TRAIL</h3>
          <AuditTrailFeed entries={auditTrail} />
        </div>
      </div>
    </aside>
  );
}
