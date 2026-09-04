import type { Mitigation } from "../../types/incident";
import { mitigationClock } from "../../lib/wireFormat";

/**
 * Read-time truth: the same is_expired evaluation the backend makes at
 * query time, recomputed here every second against the live clock.
 */
export function MitigationReadout({ mitigation, now }: { mitigation: Mitigation; now: Date }) {
  const clock = mitigationClock(mitigation.appliedAt, mitigation.ttlMinutes, now);

  if (clock.isExpired) {
    return (
      <div className="flex items-center gap-2 border border-accent bg-accent px-2.5 py-1.5">
        <span className="text-xs font-bold tracking-[0.08em] text-accent-ink">
          MITIGATION EXPIRED {clock.display} AGO — UNWIND REQUIRED
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border border-rule px-2.5 py-1.5">
      <span className="text-xs text-ink-dim">{mitigation.summary}</span>
      <span className="ml-auto shrink-0 font-wire text-xs font-semibold tabular-nums text-ink">
        EXPIRES {clock.display}
      </span>
    </div>
  );
}
