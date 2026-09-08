import type { ReactNode } from "react";

interface ScreenHeaderProps {
  subtitle: string;
  children?: ReactNode;
}

/**
 * The masthead every secondary screen repeats (User Directory, Past
 * Incidents, Audit Log) so "POSTMORTEM" stays the one visual anchor across
 * every top-level screen, per DESIGN.md — each screen supplies its own
 * subtitle and right-side actions rather than swapping the nameplate itself.
 */
export function ScreenHeader({ subtitle, children }: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-double border-steel bg-paper px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
        <div>
          <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
            POSTMORTEM
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">{subtitle}</p>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
