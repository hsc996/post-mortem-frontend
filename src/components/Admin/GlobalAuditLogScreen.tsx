import { motion } from "motion/react";
import { useGlobalAuditLog } from "../../hooks/useGlobalAuditLog";
import { formatWireDate } from "../../lib/wireFormat";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";

interface GlobalAuditLogScreenProps {
  token: string;
  onBack: () => void;
}

/**
 * The system-wide log — spans incidents, mitigations, and users. This is
 * the only place a USER_ROLE_CHANGED entry is ever visible; the per-incident
 * audit trail elsewhere in the app deliberately excludes it.
 */
export function GlobalAuditLogScreen({ token, onBack }: GlobalAuditLogScreenProps) {
  const { entries, loadError, reload } = useGlobalAuditLog(token);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b-4 border-double border-steel bg-paper px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
          <div>
            <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
              AUDIT LOG
            </p>
            <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">
              SYSTEM-WIDE — EVERY LOGGED ACTION
            </p>
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

      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
        {loadError && (
          <div className="mb-4 flex items-center justify-between gap-3 border border-alarm-muted px-2.5 py-1.5">
            <p className="text-xs text-alarm-muted">{loadError}</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold tracking-[0.1em] text-alarm-muted transition-colors hover:text-ink focus-visible:text-ink"
            >
              RETRY
            </button>
          </div>
        )}

        {entries === null && !loadError && <p className="text-sm text-ink-dim">LOADING LOG…</p>}

        {entries && entries.length === 0 && <p className="text-sm text-ink-dim">No entries on file.</p>}

        {entries && entries.length > 0 && (
          <motion.ul initial="hidden" animate="show" variants={feedContainerVariants} className="flex flex-col">
            {entries.map((entry) => (
              <motion.li key={entry.id} variants={feedItemVariants} className="flex flex-col gap-1 border-b border-rule py-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xs tabular-nums text-ink-dim">{formatWireDate(entry.occurredAt)}</span>
                  <span className="text-xs font-bold tracking-[0.04em] text-ink">{entry.action}</span>
                  <span className="text-xs text-ink-dim">{entry.actorName}</span>
                  <span className="text-xs text-ink-dim">→ {entry.entityLabel}</span>
                </div>
                {entry.detail && <p className="text-xs text-ink-dim">{entry.detail}</p>}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </main>
    </div>
  );
}
