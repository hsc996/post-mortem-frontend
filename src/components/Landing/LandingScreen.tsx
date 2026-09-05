import { motion, MotionConfig } from "motion/react";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import heroFeed from "../../assets/landing/hero-feed.jpg";
import readTimeTruth from "../../assets/landing/read-time-truth.png";
import optimisticLocking from "../../assets/landing/optimistic-locking.png";
import auditTrail from "../../assets/landing/audit-trail.png";

interface LandingScreenProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

interface Mechanism {
  heading: string;
  body: string;
  image: string;
  alt: string;
}

const MECHANISMS: Mechanism[] = [
  {
    heading: "NOTHING IS EVER STALE.",
    body: "A mitigation's expiry isn't pushed to you and cached — it's computed the instant you look, from when it was applied and how long it was meant to last. If it's expired, the wire says so the moment you open it, not whenever the last update happened to arrive.",
    image: readTimeTruth,
    alt: "An expired mitigation shown as a solid alarm banner, computed live rather than cached",
  },
  {
    heading: "TWO RESPONDERS, ONE INCIDENT, ZERO SILENT OVERWRITES.",
    body: "Every edit carries the version it was based on. If someone else moved first, your update is rejected outright with a real conflict to resolve — never a quiet overwrite of their work.",
    image: optimisticLocking,
    alt: "A version-conflict notice: expected version 4, but current version is 5",
  },
  {
    heading: "EVERY ACTION PUNCHES A NEW LINE.",
    body: "Claims, mitigations, resolutions, role changes — every mutation writes an append-only entry in the same transaction. The audit trail isn't a feature you maintain; it's infrastructure that's already there when you need it.",
    image: auditTrail,
    alt: "An append-only audit trail listing claim, mitigation, and log entries in order",
  },
];

export function LandingScreen({ onSignIn, onGetStarted }: LandingScreenProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper">
        <header className="border-b-4 border-double border-steel px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <p className="font-display text-lg font-extrabold uppercase tracking-wide text-ink sm:text-xl">
                POSTMORTEM
              </p>
              <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">INCIDENT WIRE</p>
            </div>
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
            >
              SIGN IN
            </button>
          </div>
        </header>

        <motion.main
          initial="hidden"
          animate="show"
          variants={feedContainerVariants}
          className="mx-auto flex max-w-5xl flex-col gap-20 px-5 py-16 sm:px-8 sm:py-24"
        >
          <motion.section
            variants={feedItemVariants}
            className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16"
          >
            <div className="flex flex-1 flex-col gap-6">
              <h1 className="font-display text-3xl font-extrabold uppercase leading-tight tracking-wide text-ink sm:text-4xl lg:text-5xl">
                Incidents don't wait for a wiki page to load.
              </h1>
              <p className="max-w-[52ch] text-sm leading-relaxed text-ink-dim sm:text-base">
                PostMortem is a real-time incident wire — a deterministic system of record built for the moment
                everything's on fire, not a doc pretending to be one.
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex min-h-11 w-fit items-center justify-center border border-ink px-6 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
              >
                CREATE YOUR ACCOUNT
              </button>
            </div>
            <div className="w-full flex-1">
              <img
                src={heroFeed}
                alt="The live incident wire, showing a mix of open, mitigated, and expired incidents"
                className="w-full border border-rule"
              />
            </div>
          </motion.section>

          <div className="flex flex-col gap-16">
            {MECHANISMS.map((mechanism, i) => (
              <motion.section
                key={mechanism.heading}
                variants={feedItemVariants}
                className={`flex flex-col items-start gap-8 border-t border-rule pt-16 lg:items-center lg:gap-16 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <div className="flex flex-1 flex-col gap-4">
                  <h2 className="text-xl font-semibold uppercase tracking-[0.06em] text-ink sm:text-2xl">
                    {mechanism.heading}
                  </h2>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-ink-dim sm:text-base">{mechanism.body}</p>
                </div>
                <div className="w-full flex-1">
                  <img src={mechanism.image} alt={mechanism.alt} className="w-full border border-rule" />
                </div>
              </motion.section>
            ))}
          </div>

          <motion.section
            variants={feedItemVariants}
            className="flex flex-col items-center gap-6 border-t border-rule pt-16 text-center"
          >
            <h2 className="font-display max-w-[24ch] text-2xl font-extrabold uppercase leading-tight tracking-wide text-ink sm:text-3xl">
              Your team's next incident is coming.
            </h2>
            <p className="max-w-[48ch] text-sm text-ink-dim sm:text-base">
              Get the wire up before it does.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex min-h-11 w-fit items-center justify-center border border-ink px-6 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
            >
              CREATE YOUR ACCOUNT
            </button>
          </motion.section>

          <motion.p variants={feedItemVariants} className="text-center text-xs tracking-[0.2em] text-ink-dim">
            — 30 —
          </motion.p>
        </motion.main>
      </div>
    </MotionConfig>
  );
}
