import type { Mitigation, Status } from "../../types/incident";
import { mitigationClock } from "../../lib/wireFormat";

const LABEL: Record<Status, string> = {
  open: "OPEN",
  mitigated: "MITIGATED",
  resolved: "RESOLVED",
};

/**
 * Three status colors, not two: OPEN (amber — needs action, nothing done
 * yet) reads distinctly from MITIGATED (green — stable, monitored), and
 * both are distinct from RESOLVED (dim, no hue — quiet, done). Alarm red
 * is reserved for genuine alarm states — which MITIGATED itself becomes,
 * without a status-field change, the instant its own mitigation's TTL
 * lapses (see EXPIRED below): the same read-time-truth check the
 * mitigation readout makes, so the tag never claims "stable" a beat after
 * the readout starts saying "needs a human now."
 */
const COLOR: Record<Status, string> = {
  open: "text-amber",
  mitigated: "text-nominal",
  resolved: "text-ink-dim",
};

const DOT: Record<Status, string> = {
  open: "bg-amber",
  mitigated: "bg-nominal",
  resolved: "",
};

interface StatusTagProps {
  status: Status;
  mitigation?: Mitigation | null;
  now?: Date;
}

export function StatusTag({ status, mitigation, now }: StatusTagProps) {
  const isExpiredMitigation =
    status === "mitigated" && mitigation != null && now != null
      ? mitigationClock(mitigation.appliedAt, mitigation.ttlMinutes, now).isExpired
      : false;

  const isLive = status !== "resolved";
  const label = isExpiredMitigation ? "MITIGATED · EXPIRED" : LABEL[status];
  const colorClass = isExpiredMitigation ? "text-alarm" : COLOR[status];
  const dotColor = isExpiredMitigation ? "bg-alarm" : DOT[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] ${colorClass}`}>
      {isLive && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotColor}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`} />
        </span>
      )}
      {label}
    </span>
  );
}
