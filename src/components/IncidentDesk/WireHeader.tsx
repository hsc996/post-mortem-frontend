import { useClock } from "../../hooks/useClock";
import { formatWireClock } from "../../lib/wireFormat";
import type { CurrentUser } from "../../types/user";

interface WireHeaderProps {
  currentUser: CurrentUser;
  onCycleRole: () => void;
}

export function WireHeader({ currentUser, onCycleRole }: WireHeaderProps) {
  const now = useClock();

  return (
    <header className="border-b-4 border-double border-steel px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
        <div>
          <p className="font-wire text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            POSTMORTEM
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">
            INCIDENT WIRE
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={onCycleRole}
            aria-label={`Viewing as ${currentUser.name}, role ${currentUser.role}. Click to switch role (demo control).`}
            className="text-xs font-semibold tracking-[0.06em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
          >
            {currentUser.name} · {currentUser.role.toUpperCase()}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-xs font-semibold tracking-[0.15em] text-accent">
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
