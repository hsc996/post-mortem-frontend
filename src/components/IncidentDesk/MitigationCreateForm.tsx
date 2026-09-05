import { useState, type FormEvent } from "react";

interface MitigationCreateFormProps {
  pending: boolean;
  blockedReason: string | null;
  onSubmit: (summary: string, ttlMinutes: number) => void;
  onCancel: () => void;
}

/**
 * Inline, not a slide-over — mitigation creation is inherently scoped to the
 * incident already open in this panel, so it swaps into the action row's
 * spot the same way ConflictNotice does, rather than opening a second panel.
 */
export function MitigationCreateForm({ pending, blockedReason, onSubmit, onCancel }: MitigationCreateFormProps) {
  const [summary, setSummary] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState(60);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(summary, ttlMinutes);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="mitigation-summary" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
          MITIGATION SUMMARY
        </label>
        <textarea
          id="mitigation-summary"
          required
          minLength={5}
          maxLength={2000}
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full resize-none border border-rule bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-dim"
          placeholder="Pinned previous cert chain on edge nodes"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mitigation-ttl" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
          TTL (MINUTES)
        </label>
        <input
          id="mitigation-ttl"
          type="number"
          required
          min={1}
          max={10080}
          value={ttlMinutes}
          onChange={(e) => setTtlMinutes(Number(e.target.value))}
          className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink"
        />
      </div>

      {blockedReason && <p className="border border-rule px-2.5 py-1.5 text-xs text-ink-dim">{blockedReason}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 flex-1 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
        >
          {pending ? "APPLYING…" : "APPLY"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex min-h-11 items-center px-4 text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink disabled:opacity-50"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
