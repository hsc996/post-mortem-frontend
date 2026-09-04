import { KeyHint } from "./KeyHint";

interface UnwindControlProps {
  onUnwind: () => void;
}

/** Matches ClaimControl's button styling — one consistent action-button vocabulary. */
export function UnwindControl({ onUnwind }: UnwindControlProps) {
  return (
    <button
      type="button"
      onClick={onUnwind}
      className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
    >
      UNWIND MITIGATION
      <KeyHint char="U" />
    </button>
  );
}
