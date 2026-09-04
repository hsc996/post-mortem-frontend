interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-5 py-20 text-center sm:px-8" role="alert">
      <div>
        <p className="text-lg font-bold tracking-[0.08em] text-alarm">WIRE DOWN</p>
        <p className="mt-1 text-sm text-ink-dim">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
      >
        RECONNECT
      </button>
    </div>
  );
}
