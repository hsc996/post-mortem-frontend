import { useClock } from "../../hooks/useClock";
import { formatWireClock } from "../../lib/wireFormat";

export function WireHeader() {
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

        <div className="flex items-center gap-2.5 pb-0.5">
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
    </header>
  );
}
