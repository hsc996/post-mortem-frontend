import type { Status } from "../../types/incident";

const LABEL: Record<Status, string> = {
  open: "OPEN",
  mitigated: "MITIGATED",
  resolved: "RESOLVED",
};

/**
 * Three status colors, not two: OPEN (amber — needs action, nothing done
 * yet) reads distinctly from MITIGATED (green — stable, monitored), and
 * both are distinct from RESOLVED (dim, no hue — quiet, done). Alarm red
 * never appears here; it's reserved for genuine alarm states elsewhere.
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

export function StatusTag({ status }: { status: Status }) {
  const isLive = status !== "resolved";
  const dotColor = DOT[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] ${COLOR[status]}`}>
      {isLive && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotColor}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor}`} />
        </span>
      )}
      {LABEL[status]}
    </span>
  );
}
