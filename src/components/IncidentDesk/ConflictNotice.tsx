interface ConflictNoticeProps {
  expected: number;
  current: number;
  onReload: () => void;
  reloading: boolean;
}

/**
 * The version-conflict state this whole panel exists to make real: someone
 * else's change landed while this snapshot sat open. Blocking, not a toast —
 * a stale write here is exactly the silent clobbering optimistic locking
 * exists to prevent.
 */
export function ConflictNotice({ expected, current, onReload, reloading }: ConflictNoticeProps) {
  return (
    <div className="flex flex-col gap-3 border border-alarm bg-alarm px-3 py-3" role="alert">
      <p className="text-xs font-bold leading-relaxed tracking-[0.02em] text-alarm-ink">
        CONFLICT: incident was updated by another request. Expected version {expected}, but
        current version is {current}.
      </p>
      <button
        type="button"
        onClick={onReload}
        disabled={reloading}
        className="inline-flex min-h-11 w-fit items-center border border-alarm-ink px-4 text-xs font-semibold tracking-[0.1em] text-alarm-ink transition-colors hover:bg-alarm-ink hover:text-alarm focus-visible:bg-alarm-ink focus-visible:text-alarm disabled:opacity-50"
      >
        {reloading ? "RELOADING…" : "RELOAD LATEST"}
      </button>
    </div>
  );
}
