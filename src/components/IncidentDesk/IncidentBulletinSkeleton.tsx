export function IncidentBulletinSkeleton() {
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
      </div>
    </div>
  );
}
