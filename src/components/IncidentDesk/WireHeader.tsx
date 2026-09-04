import { useClock } from "../../hooks/useClock";
import { formatWireClock } from "../../lib/wireFormat";
import type { CurrentUser } from "../../types/user";

interface WireHeaderProps {
  currentUser: CurrentUser;
  onSignOut: () => void;
}

export function WireHeader({ currentUser, onSignOut }: WireHeaderProps) {
  const now = useClock();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-double border-steel bg-paper px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
        <div>
          <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
            POSTMORTEM
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">
            INCIDENT WIRE
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.06em] text-ink-dim">
              {currentUser.name} · {currentUser.role.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
            >
              LOG OUT
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nominal opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-nominal" />
            </span>
            <span className="text-xs font-semibold tracking-[0.15em] text-nominal">
              LIVE
            </span>
            <time
              dateTime={now.toISOString()}
              className="text-sm tabular-nums text-ink-dim"
              aria-live="off"
            >
              {formatWireClock(now)}
            </time>
          </div>
        </div>
      </div>
    </header>
  );
}
