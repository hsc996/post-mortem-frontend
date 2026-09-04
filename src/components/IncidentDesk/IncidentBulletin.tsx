import type { KeyboardEvent, MouseEvent } from "react";
import type { Incident } from "../../types/incident";
import { formatElapsed, formatWireDate } from "../../lib/wireFormat";
import { PrecedenceStamp } from "./PrecedenceStamp";
import { StatusTag } from "./StatusTag";
import { MitigationReadout } from "./MitigationReadout";
import { ClaimControl } from "./ClaimControl";

interface IncidentBulletinProps {
  incident: Incident;
  now: Date;
  canAct: boolean;
  onClaim: (id: string) => void;
  onSelect: (id: string, opener: HTMLElement) => void;
}

export function IncidentBulletin({ incident, now, canAct, onClaim, onSelect }: IncidentBulletinProps) {
  const isResolved = incident.status === "resolved";

  const handleSelect = (e: MouseEvent<HTMLElement>) => onSelect(incident.id, e.currentTarget);
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(incident.id, e.currentTarget);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`View incident detail: ${incident.title}`}
      className={`cursor-pointer border-b border-rule px-5 py-4 transition-colors hover:bg-paper-dim/60 focus-visible:bg-paper-dim/60 sm:px-8 ${
        isResolved ? "opacity-70" : ""
      }`}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <PrecedenceStamp severity={incident.severity} />
            <span className="text-xs tabular-nums text-ink-dim">
              {formatWireDate(incident.createdAt)}
            </span>
            <span className="text-xs text-ink-dim">{incident.serviceName}</span>
          </div>
          <StatusTag status={incident.status} />
        </div>

        <h2 className="font-display text-base font-bold text-ink sm:text-lg">{incident.title}</h2>

        <div className="text-xs text-ink-dim">
          REPORTED BY {incident.reporterName.toUpperCase()} · {formatElapsed(incident.createdAt, now)}
          {isResolved && incident.resolvedAt && (
            <> · RESOLVED {formatElapsed(incident.resolvedAt, now)}</>
          )}
        </div>

        {incident.mitigation && <MitigationReadout mitigation={incident.mitigation} now={now} />}

        {!isResolved && (canAct || incident.assigneeName) && (
          <div className="flex justify-end pt-0.5" onClick={(e) => e.stopPropagation()}>
            <ClaimControl assigneeName={incident.assigneeName} onClaim={() => onClaim(incident.id)} />
          </div>
        )}
      </div>
    </article>
  );
}
