export type ActionRowKind = "button" | "badge" | "none";

interface IncidentBulletinSkeletonProps {
  hasMitigation: boolean;
  actionRowKind: ActionRowKind;
}

/**
 * Reuses the real bulletin's own box model (same border/padding wrappers
 * as MitigationReadout and ClaimControl) so a skeleton row's height
 * genuinely matches its real counterpart instead of just approximating it.
 */
export function IncidentBulletinSkeleton({ hasMitigation, actionRowKind }: IncidentBulletinSkeletonProps) {
  return (
    <div className="border-b border-rule px-5 py-4 sm:px-8" aria-hidden="true">
      <div className="mx-auto flex max-w-4xl animate-pulse flex-col gap-2.5">
        <div className="flex items-baseline gap-3">
          <div className="h-3.5 w-16 bg-ink-dim/20" />
          <div className="h-3 w-12 bg-ink-dim/15" />
          <div className="h-3 w-24 bg-ink-dim/15" />
        </div>
        <div className="h-5 w-3/5 bg-ink-dim/20" />
        <div className="h-3 w-2/5 bg-ink-dim/15" />

        {hasMitigation && (
          <div className="flex items-center gap-2 border border-rule px-2.5 py-1.5">
            <div className="h-3 w-1/3 bg-ink-dim/15" />
            <div className="ml-auto h-3 w-16 shrink-0 bg-ink-dim/15" />
          </div>
        )}

        {actionRowKind !== "none" && (
          <div className="flex justify-end pt-0.5">
            {actionRowKind === "button" ? (
              <div className="h-11 w-20 border border-rule" />
            ) : (
              <div className="h-6 w-28 border border-rule" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
