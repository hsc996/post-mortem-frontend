import { useEffect, useState, type FormEvent } from "react";
import { motion, MotionConfig } from "motion/react";
import { ApiError } from "../../lib/apiClient";
import * as inviteApi from "../../lib/inviteApi";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import { TextField } from "./TextField";

interface AcceptInviteScreenProps {
  token: string;
  onAccepted: (accessToken: string) => Promise<void>;
}

type PreviewState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "accepted" }
  | { status: "ready"; email: string; role: string };

export function AcceptInviteScreen({ token, onAccepted }: AcceptInviteScreenProps) {
  const [preview, setPreview] = useState<PreviewState>({ status: "loading" });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    inviteApi
      .fetchInvitePreview(token)
      .then((dto) => {
        if (cancelled) return;
        setPreview({ status: "ready", email: dto.email, role: dto.role });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 410) setPreview({ status: "expired" });
        else if (err instanceof ApiError && err.status === 409) setPreview({ status: "accepted" });
        else setPreview({ status: "invalid" });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const accessToken = await inviteApi.acceptInvite(token, { password, firstName, lastName });
      await onAccepted(accessToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen items-center justify-center bg-paper px-5">
        <motion.div className="w-full max-w-sm" initial="hidden" animate="show" variants={feedContainerVariants}>
          <motion.div variants={feedItemVariants} className="mb-8 text-center">
            <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
              POSTMORTEM
            </p>
            <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">ACCEPT INVITE</p>
          </motion.div>

          {preview.status === "loading" && (
            <motion.p variants={feedItemVariants} className="text-center text-sm text-ink-dim">
              CHECKING INVITE…
            </motion.p>
          )}

          {preview.status === "invalid" && (
            <motion.p
              variants={feedItemVariants}
              className="border border-alarm-muted px-2.5 py-1.5 text-center text-xs text-alarm-muted"
            >
              This invite link isn't valid. Ask your admin to send a new one.
            </motion.p>
          )}

          {preview.status === "expired" && (
            <motion.p
              variants={feedItemVariants}
              className="border border-alarm-muted px-2.5 py-1.5 text-center text-xs text-alarm-muted"
            >
              This invite has expired. Ask your admin to send a new one.
            </motion.p>
          )}

          {preview.status === "accepted" && (
            <motion.p
              variants={feedItemVariants}
              className="border border-rule px-2.5 py-1.5 text-center text-xs text-ink-dim"
            >
              This invite has already been accepted. Sign in instead.
            </motion.p>
          )}

          {preview.status === "ready" && (
            <>
              <motion.p variants={feedItemVariants} className="mb-6 text-center text-sm text-ink">
                You've been invited as <span className="font-semibold">{preview.role.toUpperCase()}</span> —{" "}
                {preview.email}
              </motion.p>

              <motion.form
                variants={feedItemVariants}
                onSubmit={(e) => void handleSubmit(e)}
                className="flex flex-col gap-4"
              >
                <div className="flex gap-3">
                  <TextField
                    label="First name"
                    name="firstName"
                    autoComplete="given-name"
                    required
                    containerClassName="flex-1"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    label="Last name"
                    name="lastName"
                    autoComplete="family-name"
                    required
                    containerClassName="flex-1"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-ink-dim">Must be at least 12 characters.</p>

                {error && (
                  <p className="border border-alarm-muted px-2.5 py-1.5 text-xs text-alarm-muted">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 inline-flex min-h-11 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
                >
                  {busy ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
                </button>
              </motion.form>
            </>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
