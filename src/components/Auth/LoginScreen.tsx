import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, MotionConfig } from "motion/react";
import { ApiError } from "../../lib/authApi";
import { RateLimitError } from "../../lib/apiClient";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import { TextField } from "./TextField";

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  sessionExpired: boolean;
}

export function LoginScreen({ onSignIn, sessionExpired }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState(0);
  const retryIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (retryIntervalRef.current !== null) window.clearInterval(retryIntervalRef.current);
    };
  }, []);

  const startRetryCountdown = (seconds: number) => {
    setRetryIn(seconds);
    if (retryIntervalRef.current !== null) window.clearInterval(retryIntervalRef.current);
    retryIntervalRef.current = window.setInterval(() => {
      setRetryIn((n) => {
        if (n <= 1 && retryIntervalRef.current !== null) {
          window.clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
        return Math.max(0, n - 1);
      });
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSignIn(email, password);
    } catch (err) {
      if (err instanceof RateLimitError) {
        startRetryCountdown(err.retryAfterSeconds);
      }
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
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">INCIDENT WIRE</p>
        </motion.div>

        {sessionExpired && (
          <motion.p
            variants={feedItemVariants}
            className="mb-6 border border-alarm-muted px-2.5 py-1.5 text-xs text-alarm-muted"
          >
            Your session ended. Sign in again to continue.
          </motion.p>
        )}

        <motion.form
          variants={feedItemVariants}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="border border-alarm-muted px-2.5 py-1.5 text-xs text-alarm-muted">
              {error}
              {retryIn > 0 && ` (${retryIn}s)`}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || retryIn > 0}
            className="mt-2 inline-flex min-h-11 items-center justify-center border border-ink text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper disabled:opacity-50"
          >
            {retryIn > 0 ? `TRY AGAIN IN ${retryIn}S` : busy ? "SIGNING IN…" : "SIGN IN"}
          </button>

          <p className="mt-2 text-center text-xs text-ink-dim">
            New accounts are invite-only — ask an admin to send you an invite.
          </p>
        </motion.form>
      </motion.div>
    </div>
    </MotionConfig>
  );
}
