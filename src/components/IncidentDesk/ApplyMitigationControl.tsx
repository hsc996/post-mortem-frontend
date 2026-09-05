import { KeyHint } from "./KeyHint";

interface ApplyMitigationControlProps {
  onApply: () => void;
}

/** Matches ClaimControl/UnwindControl's button styling — one consistent action-button vocabulary. */
export function ApplyMitigationControl({ onApply }: ApplyMitigationControlProps) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
    >
      APPLY MITIGATION
      <KeyHint char="M" />
    </button>
  );
}
