import { useId, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { Role } from "../../types/user";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";

const ROLES: Role[] = ["admin", "responder", "viewer"];

interface InviteUserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string, role: Role) => Promise<{ ok: true; inviteLink: string } | { ok: false; reason: string }>;
}

export function InviteUserPanel({ isOpen, onClose, onSend }: InviteUserPanelProps) {
  const titleId = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentLink, setSentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setEmail("");
    setRole("viewer");
    setError(null);
    setSentLink(null);
    setCopied(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await onSend(email, role);
    setPending(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setSentLink(result.inviteLink);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCopy = () => {
    if (!sentLink) return;
    void navigator.clipboard.writeText(sentLink).then(() => setCopied(true));
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
            INVITE USER
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close invite form"
            className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
          >
            CLOSE
          </button>
        </motion.div>

        {sentLink ? (
          <motion.div variants={feedItemVariants} className="flex flex-col gap-4 px-5 py-4">
            <p className="text-sm text-ink">Invite created for {email}.</p>
            <p className="text-xs text-ink-dim">
              Share this link with them directly — it also gets emailed if delivery is configured.
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-[0.1em] text-ink-dim">INVITE LINK</span>
              <div className="flex border border-rule">
                <input
                  readOnly
                  value={sentLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-h-11 w-full flex-1 bg-transparent px-3 text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-11 shrink-0 border-l border-rule px-3 text-xs font-semibold tracking-[0.08em] text-ink-dim transition-colors hover:text-ink"
                >
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex min-h-11 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
            >
              INVITE ANOTHER
            </button>
          </motion.div>
        ) : (
          <motion.form
            variants={feedItemVariants}
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4 px-5 py-4"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invite-email" className="text-xs font-semibold tracking-[0.1em] text-ink-dim">
                EMAIL
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 w-full border border-rule bg-transparent px-3 text-sm text-ink placeholder:text-ink-dim"
                placeholder="new.responder@company.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-[0.1em] text-ink-dim">ROLE</span>
              <div className="flex border border-rule">
                {ROLES.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`min-h-11 flex-1 px-2 text-xs font-semibold tracking-[0.06em] transition-colors ${
                      i > 0 ? "border-l border-rule" : ""
                    } ${role === r ? "bg-ink text-paper" : "text-ink-dim hover:text-ink"}`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="border border-alarm-muted px-2.5 py-1.5 text-xs text-alarm-muted">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex min-h-11 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
            >
              {pending ? "SENDING…" : "SEND INVITE"}
            </button>
          </motion.form>
        )}
      </motion.div>
    </aside>
  );
}
