import type { Incident } from "../../types/incident";
import { ClaimControl } from "./ClaimControl";
import { UnwindControl } from "./UnwindControl";

interface PanelActionRowProps {
  incident: Incident;
  onClaim: () => void;
  onResolve: () => void;
  onUnwind: () => void;
  blockedReason: string | null;
  successMessage: string | null;
}

/**
 * One clearly separable block so a future read-only/viewer variant can
 * swap it wholesale without restructuring the panel around it.
 */
export function PanelActionRow({
  incident,
  onClaim,
  onResolve,
  onUnwind,
  blockedReason,
  successMessage,
}: PanelActionRowProps) {
  if (incident.status === "resolved") {
    return <p className="text-xs text-ink-dim">Resolved — no further action needed.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ClaimControl assigneeName={incident.assigneeName} onClaim={onClaim} />
        {incident.mitigation && <UnwindControl onUnwind={onUnwind} />}
        <button
          type="button"
          onClick={onResolve}
          className="ml-auto inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
        >
          RESOLVE
        </button>
      </div>

      {blockedReason && (
        <p className="border border-rule px-2.5 py-1.5 text-xs text-ink-dim">{blockedReason}</p>
      )}
      {successMessage && (
        <p className="text-xs font-semibold tracking-[0.04em] text-ink">{successMessage}</p>
      )}
    </div>
  );
}
