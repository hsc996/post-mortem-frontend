import { IncidentBulletinSkeleton, type ActionRowKind } from "./IncidentBulletinSkeleton";

export interface SkeletonSpec {
  hasMitigation: boolean;
  actionRowKind: ActionRowKind;
}

interface LoadingStateProps {
  specs: SkeletonSpec[];
}

export function LoadingState({ specs }: LoadingStateProps) {
  return (
    <div role="status">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-5 py-4 sm:px-8">
        <span className="text-sm tracking-[0.1em] text-ink-dim">RECEIVING WIRE</span>
        <span className="h-4 w-2 animate-pulse bg-ink-dim" aria-hidden="true" />
      </div>
      {specs.map((spec, i) => (
        <IncidentBulletinSkeleton key={i} hasMitigation={spec.hasMitigation} actionRowKind={spec.actionRowKind} />
      ))}
      <span className="sr-only">Loading incidents</span>
    </div>
  );
}
