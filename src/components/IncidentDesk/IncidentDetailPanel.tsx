import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import type { AuditEntry, Incident } from "../../types/incident";
import type { PanelActionResult } from "../../types/panelAction";
import { useClock } from "../../hooks/useClock";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import { PrecedenceStamp } from "./PrecedenceStamp";
import { StatusTag } from "./StatusTag";
import { MitigationReadout } from "./MitigationReadout";
import { PanelActionRow } from "./PanelActionRow";
import { MitigationCreateForm } from "./MitigationCreateForm";
import { ConflictNotice } from "./ConflictNotice";
import { AuditTrailFeed } from "./AuditTrailFeed";

interface IncidentDetailPanelProps {
  initialIncident: Incident;
  auditTrail: AuditEntry[];
  canAct: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onResolve: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onUnwind: (id: string, expectedVersion: number) => Promise<PanelActionResult>;
  onApplyMitigation: (id: string, summary: string, ttlMinutes: number) => Promise<PanelActionResult>;
  onReload: (id: string) => Promise<Incident | null>;
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
  auditTrail,
  canAct,
  isOpen,
  onClose,
  onClaim,
  onResolve,
  onUnwind,
  onApplyMitigation,
  onReload,
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
  const [pending, setPending] = useState(false);
  const [showMitigationForm, setShowMitigationForm] = useState(false);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  const settle = useCallback((result: PanelActionResult, successText: string) => {
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
  }, []);

  const dispatch = useCallback(
    async (action: (id: string, version: number) => Promise<PanelActionResult>, successText: string) => {
      setPending(true);
      const result = await action(snapshot.id, snapshot.version);
      setPending(false);
      settle(result, successText);
    },
    [snapshot, settle],
  );

  const dispatchMitigation = useCallback(
    async (summary: string, ttlMinutes: number) => {
      setPending(true);
      const result = await onApplyMitigation(snapshot.id, summary, ttlMinutes);
      setPending(false);
      settle(result, "Mitigation applied.");
      if (result.ok) setShowMitigationForm(false);
    },
    [snapshot.id, onApplyMitigation, settle],
  );

  const [reloading, setReloading] = useState(false);

  const handleReload = async () => {
    setReloading(true);
    const fresh = await onReload(snapshot.id);
    setReloading(false);
    if (!fresh) return;
    setSnapshot(fresh);
    setConflict(null);
    setBlockedReason(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMitigationForm) {
          setShowMitigationForm(false);
          setBlockedReason(null);
        } else {
          onClose();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const isResolved = snapshot.status === "resolved";
      const key = e.key.toLowerCase();
      if (pending || showMitigationForm) return;
      if (key === "c" && canAct && !isResolved && !snapshot.assigneeName) {
        e.preventDefault();
        void dispatch(onClaim, "Claimed.");
      } else if (key === "r" && canAct && !isResolved) {
        e.preventDefault();
        void dispatch(onResolve, "Resolved.");
      } else if (key === "u" && canAct && !isResolved && snapshot.mitigation) {
        e.preventDefault();
        void dispatch(onUnwind, "Mitigation cleared.");
      } else if (key === "m" && canAct && !isResolved && !snapshot.mitigation) {
        e.preventDefault();
        setShowMitigationForm(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, canAct, snapshot, dispatch, onClaim, onResolve, onUnwind, pending, showMitigationForm]);

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      inert={!isOpen}
      className={`fixed inset-x-0 bottom-0 top-auto z-40 flex max-h-[85vh] w-full flex-col border-t border-rule bg-paper-raised transition-transform duration-300 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-[106px] sm:max-h-none sm:w-full sm:max-w-md sm:border-l sm:border-t-0 md:max-w-lg ${
        isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
      }`}
    >
      <motion.div
        className="flex h-full flex-col overflow-y-auto"
        initial="hidden"
        animate="show"
        variants={feedContainerVariants}
      >
        <motion.div
          variants={feedItemVariants}
          className="flex items-start justify-between gap-3 border-b border-rule px-5 py-4"
        >
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
              className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
            >
              CLOSE
            </button>
          </div>
        </motion.div>

        <motion.div variants={feedItemVariants} className="flex flex-col gap-4 px-5 py-4">
          <h2 id={titleId} className="font-title text-xl font-semibold text-ink">
            {snapshot.title}
          </h2>
          <p className="text-sm text-ink-dim">{snapshot.description}</p>

          {snapshot.mitigation && <MitigationReadout mitigation={snapshot.mitigation} now={now} />}

          {conflict ? (
            <ConflictNotice
              expected={conflict.expected}
              current={conflict.current}
              onReload={() => void handleReload()}
              reloading={reloading}
            />
          ) : showMitigationForm ? (
            <MitigationCreateForm
              pending={pending}
              blockedReason={blockedReason}
              onSubmit={(summary, ttlMinutes) => void dispatchMitigation(summary, ttlMinutes)}
              onCancel={() => {
                setShowMitigationForm(false);
                setBlockedReason(null);
              }}
            />
          ) : (
            <PanelActionRow
              incident={snapshot}
              canAct={canAct}
              onClaim={() => void dispatch(onClaim, "Claimed.")}
              onResolve={() => void dispatch(onResolve, "Resolved.")}
              onUnwind={() => void dispatch(onUnwind, "Mitigation cleared.")}
              onApplyMitigation={() => setShowMitigationForm(true)}
              blockedReason={blockedReason}
              successMessage={successMessage}
              pending={pending}
            />
          )}
        </motion.div>

        <motion.div variants={feedItemVariants} className="flex flex-col gap-2 border-t border-rule px-5 py-4">
          <h3 className="text-xs font-semibold tracking-[0.15em] text-ink-dim">AUDIT TRAIL</h3>
          <AuditTrailFeed entries={auditTrail} />
        </motion.div>
      </motion.div>
    </aside>
  );
}
