import { IncidentBulletinSkeleton } from "./IncidentBulletinSkeleton";

const SKELETON_COUNT = 5;

export function LoadingState() {
  return (
    <div role="status">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-5 py-4 sm:px-8">
        <span className="text-sm tracking-[0.1em] text-ink-dim">RECEIVING WIRE</span>
        <span className="h-4 w-2 animate-[blink_1s_steps(1)_infinite] bg-ink-dim" aria-hidden="true" />
      </div>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <IncidentBulletinSkeleton key={i} />
      ))}
      <span className="sr-only">Loading incidents</span>
    </div>
  );
}
