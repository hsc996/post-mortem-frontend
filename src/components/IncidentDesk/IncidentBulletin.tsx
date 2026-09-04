import type { Incident } from "../../types/incident";
import { formatElapsed, formatWireDate } from "../../lib/wireFormat";
import { PrecedenceStamp } from "./PrecedenceStamp";
import { StatusTag } from "./StatusTag";
import { MitigationReadout } from "./MitigationReadout";
import { ClaimControl } from "./ClaimControl";

interface IncidentBulletinProps {
  incident: Incident;
  now: Date;
  onClaim: (id: string) => void;
}

export function IncidentBulletin({ incident, now, onClaim }: IncidentBulletinProps) {
  const isResolved = incident.status === "resolved";

  return (
    <article className={`border-b border-rule px-5 py-4 sm:px-8 ${isResolved ? "opacity-70" : ""}`}>
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

        <h2 className="font-wire text-base text-ink sm:text-lg">{incident.title}</h2>

        <div className="text-xs text-ink-dim">
          REPORTED BY {incident.reporterName.toUpperCase()} · {formatElapsed(incident.createdAt, now)}
          {isResolved && incident.resolvedAt && (
            <> · RESOLVED {formatElapsed(incident.resolvedAt, now)}</>
          )}
        </div>

        {incident.mitigation && <MitigationReadout mitigation={incident.mitigation} now={now} />}

        {!isResolved && (
          <div className="flex justify-end pt-0.5">
            <ClaimControl assigneeName={incident.assigneeName} onClaim={() => onClaim(incident.id)} />
          </div>
        )}
      </div>
    </article>
  );
}
