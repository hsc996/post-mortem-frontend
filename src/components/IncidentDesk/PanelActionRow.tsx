import type { Incident } from "../../types/incident";
import { ClaimControl } from "./ClaimControl";
import { UnwindControl } from "./UnwindControl";
import { KeyHint } from "./KeyHint";

interface PanelActionRowProps {
  incident: Incident;
  canAct: boolean;
  onClaim: () => void;
  onResolve: () => void;
  onUnwind: () => void;
  blockedReason: string | null;
  successMessage: string | null;
  pending: boolean;
}

/**
 * One clearly separable block so the read-only/viewer variant swaps
 * wholesale without restructuring the panel around it.
 */
export function PanelActionRow({
  incident,
  canAct,
  onClaim,
  onResolve,
  onUnwind,
  blockedReason,
  successMessage,
  pending,
}: PanelActionRowProps) {
  if (incident.status === "resolved") {
    return <p className="text-xs text-ink-dim">Resolved — no further action needed.</p>;
  }

  if (!canAct) {
    return (
      <p className="border border-rule px-2.5 py-1.5 text-xs text-ink-dim">
        VIEW ONLY — operation not permitted for current user role.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-4 ${pending ? "opacity-50" : ""}`}>
        <ClaimControl assigneeName={incident.assigneeName} onClaim={pending ? () => {} : onClaim} shortcutHint="C" />
        {incident.mitigation && <UnwindControl onUnwind={pending ? () => {} : onUnwind} />}
        <button
          type="button"
          onClick={onResolve}
          disabled={pending}
          className="ml-auto inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:pointer-events-none"
        >
          RESOLVE
          <KeyHint char="R" />
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
