interface ConflictNoticeProps {
  expected: number;
  current: number;
  onReload: () => void;
}

/**
 * The version-conflict state this whole panel exists to make real: someone
 * else's change landed while this snapshot sat open. Blocking, not a toast —
 * a stale write here is exactly the silent clobbering optimistic locking
 * exists to prevent.
 */
export function ConflictNotice({ expected, current, onReload }: ConflictNoticeProps) {
  return (
    <div className="flex flex-col gap-3 border border-accent bg-accent px-3 py-3" role="alert">
      <p className="text-xs font-bold leading-relaxed tracking-[0.02em] text-accent-ink">
        CONFLICT: incident was updated by another request. Expected version {expected}, but
        current version is {current}.
      </p>
      <button
        type="button"
        onClick={onReload}
        className="inline-flex min-h-11 w-fit items-center border border-accent-ink px-4 text-xs font-semibold tracking-[0.1em] text-accent-ink transition-colors hover:bg-accent-ink hover:text-accent focus-visible:bg-accent-ink focus-visible:text-accent"
      >
        RELOAD LATEST
      </button>
    </div>
  );
}
