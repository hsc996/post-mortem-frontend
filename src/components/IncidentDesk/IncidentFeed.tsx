import type { Incident } from "../../types/incident";
import { IncidentBulletin } from "./IncidentBulletin";
import { EmptyState } from "./EmptyState";

interface IncidentFeedProps {
  incidents: Incident[];
  now: Date;
  onClaim: (id: string) => void;
  onSelect: (id: string, opener: HTMLElement) => void;
}

export function IncidentFeed({ incidents, now, onClaim, onSelect }: IncidentFeedProps) {
  if (incidents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {incidents.map((incident) => (
        <IncidentBulletin key={incident.id} incident={incident} now={now} onClaim={onClaim} onSelect={onSelect} />
      ))}
      <div className="px-5 py-6 text-center sm:px-8">
        <span className="font-wire text-xs tracking-[0.2em] text-ink-dim">— 30 —</span>
      </div>
    </div>
  );
}
