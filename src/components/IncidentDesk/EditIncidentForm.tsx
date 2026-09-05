import { useState, type FormEvent } from "react";
import type { Severity } from "../../types/incident";
import type { IncidentEditInput } from "../../lib/incidentsApi";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

interface EditIncidentFormProps {
  initial: { title: string; description: string; serviceName: string; severity: Severity };
  pending: boolean;
  blockedReason: string | null;
  onSubmit: (input: IncidentEditInput) => void;
  onCancel: () => void;
}

/**
 * Inline, not a slide-over — same reasoning as MitigationCreateForm: editing
 * is scoped to the incident already open in this panel. Only actually-changed
 * fields go in the submitted diff, both to keep the audit log's "changes"
 * entry meaningful and so an unmodified submit doesn't 400 as "no fields".
 */
export function EditIncidentForm({ initial, pending, blockedReason, onSubmit, onCancel }: EditIncidentFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [serviceName, setServiceName] = useState(initial.serviceName);
  const [severity, setSeverity] = useState<Severity>(initial.severity);

  const diff: IncidentEditInput = {
    ...(title !== initial.title ? { title } : {}),
    ...(description !== initial.description ? { description } : {}),
    ...(serviceName !== initial.serviceName ? { serviceName } : {}),
    ...(severity !== initial.severity ? { severity } : {}),
  };
  const hasChanges = Object.keys(diff).length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    onSubmit(diff);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-incident-title" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
          TITLE
        </label>
        <input
          id="edit-incident-title"
          required
          minLength={3}
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-incident-service" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
          SERVICE
        </label>
        <input
          id="edit-incident-service"
          required
          minLength={3}
          maxLength={100}
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-[0.1em] text-ink-dim">SEVERITY</span>
        <div className="flex border border-rule">
          {SEVERITIES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`min-h-11 flex-1 px-2 text-xs font-semibold tracking-[0.06em] transition-colors ${
                i > 0 ? "border-l border-rule" : ""
              } ${severity === s ? "bg-ink text-paper" : "text-ink-dim hover:text-ink"}`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-incident-description" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
          DESCRIPTION
        </label>
        <textarea
          id="edit-incident-description"
          required
          minLength={1}
          maxLength={10000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none border border-rule bg-transparent px-3 py-2 text-sm text-ink"
        />
      </div>

      {blockedReason && <p className="border border-rule px-2.5 py-1.5 text-xs text-ink-dim">{blockedReason}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !hasChanges}
          className="inline-flex min-h-11 flex-1 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
        >
          {pending ? "SAVING…" : "SAVE"}
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
