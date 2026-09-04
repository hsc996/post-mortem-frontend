interface ClaimControlProps {
  assigneeName: string | null;
  onClaim: () => void;
}

/**
 * Claiming an incident stamps a visible, permanent mark on it — ownership
 * as a physical trace, not a quiet flag nobody notices.
 */
export function ClaimControl({ assigneeName, onClaim }: ClaimControlProps) {
  if (assigneeName) {
    return (
      <span className="inline-flex items-center border border-rule px-2 py-1 font-wire text-xs tracking-[0.04em] text-ink-dim">
        CLAIMED — {assigneeName.toUpperCase()}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClaim}
      className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
    >
      CLAIM
    </button>
  );
}
