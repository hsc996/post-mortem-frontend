import { useId, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { Severity } from "../../types/incident";
import type { CreateIncidentResult } from "../../types/panelAction";
import type { IncidentCreateInput } from "../../lib/incidentsApi";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

interface NewIncidentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: IncidentCreateInput) => Promise<CreateIncidentResult>;
}

const EMPTY = { title: "", description: "", serviceName: "", severity: "medium" as Severity };

export function NewIncidentPanel({ isOpen, onClose, onCreate }: NewIncidentPanelProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await onCreate(form);
    setPending(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setForm(EMPTY);
    onClose();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <aside
      role="region"
      aria-labelledby={titleId}
      inert={!isOpen}
      className={`fixed inset-x-0 bottom-0 top-auto z-40 flex max-h-[85vh] w-full flex-col border-t border-rule bg-paper-raised transition-transform duration-300 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-[106px] sm:max-h-none sm:w-full sm:max-w-md sm:border-l sm:border-t-0 md:max-w-lg ${
        isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
      }`}
    >
      <motion.div
        className="flex h-full flex-col overflow-y-auto"
        initial="hidden"
        animate="show"
        variants={feedContainerVariants}
      >
        <motion.div
          variants={feedItemVariants}
          className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4"
        >
          <h2 id={titleId} className="font-title text-lg font-semibold text-ink">
            FILE NEW INCIDENT
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close new incident form"
            className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
          >
            CLOSE
          </button>
        </motion.div>

        <motion.form
          variants={feedItemVariants}
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-4 px-5 py-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-incident-title" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
              TITLE
            </label>
            <input
              id="new-incident-title"
              required
              minLength={3}
              maxLength={255}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink placeholder:text-ink-dim"
              placeholder="Checkout failing for EU customers"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-incident-service" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
              SERVICE
            </label>
            <input
              id="new-incident-service"
              required
              minLength={3}
              maxLength={100}
              value={form.serviceName}
              onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
              className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink placeholder:text-ink-dim"
              placeholder="payments-api"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.1em] text-ink-dim">SEVERITY</span>
            <div className="flex border border-rule">
              {SEVERITIES.map((severity, i) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, severity }))}
                  className={`min-h-11 flex-1 px-2 text-xs font-semibold tracking-[0.06em] transition-colors ${
                    i > 0 ? "border-l border-rule" : ""
                  } ${form.severity === severity ? "bg-ink text-paper" : "text-ink-dim hover:text-ink"}`}
                >
                  {severity.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-incident-description" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
              DESCRIPTION
            </label>
            <textarea
              id="new-incident-description"
              required
              minLength={1}
              maxLength={10000}
              rows={5}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full resize-none border border-rule bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-dim"
              placeholder="What's happening, what's affected, first reports…"
            />
          </div>

          {error && <p className="border border-alarm-muted px-2.5 py-1.5 text-xs text-alarm-muted">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex min-h-11 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
          >
            {pending ? "FILING…" : "FILE INCIDENT"}
          </button>
        </motion.form>
      </motion.div>
    </aside>
  );
}
