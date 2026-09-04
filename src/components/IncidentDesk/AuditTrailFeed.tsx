import { useEffect, useState } from "react";
import type { AuditAction, AuditEntry } from "../../types/incident";
import { formatWireDate } from "../../lib/wireFormat";

const ACTION_LABEL: Record<AuditAction, string> = {
  INCIDENT_CREATED: "LOGGED",
  INCIDENT_UPDATED: "UPDATED",
  INCIDENT_RESOLVED: "RESOLVED",
  MITIGATION_CREATED: "MITIGATION APPLIED",
  MITIGATION_DELETED: "MITIGATION CLEARED",
};

interface AuditTrailFeedProps {
  entries: AuditEntry[];
}

/**
 * The audit trail as its own miniature wire feed — the mechanism made
 * visible, not just asserted. Reveal is delayed once on mount, matching
 * the main feed's load discipline one level down; live updates after that
 * (a new entry from an action taken here) render immediately, no re-flash.
 */
export function AuditTrailFeed({ entries }: AuditTrailFeedProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-8 animate-pulse bg-ink-dim/10" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-xs text-ink-dim">No entries on file.</p>;
  }

  return (
    <ul className="flex flex-col">
      {entries.map((entry) => (
        <li key={entry.id} className="border-b border-rule py-2 last:border-b-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs tabular-nums text-ink-dim">{formatWireDate(entry.occurredAt)}</span>
            <span className="text-xs font-bold tracking-[0.04em] text-ink">
              {ACTION_LABEL[entry.action]}
            </span>
            <span className="text-xs text-ink-dim">{entry.actorName}</span>
          </div>
          {entry.detail && <p className="mt-0.5 text-xs text-ink-dim">{entry.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
