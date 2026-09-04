import type { Status } from "../../types/incident";

const LABEL: Record<Status, string> = {
  open: "OPEN",
  mitigated: "MITIGATED",
  resolved: "RESOLVED",
};

/** The only place color signals urgency: live (unresolved) vs. quiet (resolved). */
export function StatusTag({ status }: { status: Status }) {
  const isLive = status !== "resolved";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] ${
        isLive ? "text-nominal" : "text-ink-dim"
      }`}
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nominal opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nominal" />
        </span>
      )}
      {LABEL[status]}
    </span>
  );
}
