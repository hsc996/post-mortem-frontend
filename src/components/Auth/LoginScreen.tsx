import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ApiError, type RegisterInput } from "../../lib/authApi";
import { RateLimitError } from "../../lib/apiClient";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import { TextField } from "./TextField";

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (input: RegisterInput) => Promise<void>;
  sessionExpired: boolean;
}

type Mode = "signin" | "register";

export function LoginScreen({ onSignIn, onSignUp, sessionExpired }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      if (mode === "signin") {
        await onSignIn(email, password);
      } else {
        await onSignUp({ email, password, firstName, lastName });
      }
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

        <motion.div variants={feedItemVariants} className="relative mb-6 flex border border-rule">
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 w-1/2 bg-ink"
            animate={{ left: mode === "signin" ? "0%" : "50%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          />
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`relative z-10 min-h-11 flex-1 text-xs font-semibold tracking-[0.1em] transition-colors ${
              mode === "signin" ? "text-paper" : "text-ink-dim hover:text-ink"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`relative z-10 min-h-11 flex-1 border-l border-rule text-xs font-semibold tracking-[0.1em] transition-colors ${
              mode === "register" ? "text-paper" : "text-ink-dim hover:text-ink"
            }`}
          >
            REGISTER
          </button>
        </motion.div>

        <motion.form
          layout
          variants={feedItemVariants}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <AnimatePresence initial={false}>
            {mode === "register" && (
              <motion.div
                key="name-fields"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
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
              </motion.div>
            )}
          </AnimatePresence>

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
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 12 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AnimatePresence initial={false}>
            {mode === "register" && (
              <motion.div
                key="register-hints"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-ink-dim">Must be at least 12 characters.</p>
                  <p className="text-xs text-ink-dim">
                    New accounts start as VIEWER (read-only). An admin can grant write access afterward.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {retryIn > 0
              ? `TRY AGAIN IN ${retryIn}S`
              : busy
                ? mode === "signin"
                  ? "SIGNING IN…"
                  : "CREATING ACCOUNT…"
                : mode === "signin"
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
          </button>
        </motion.form>
      </motion.div>
    </div>
    </MotionConfig>
  );
}
