import { motion } from "motion/react";
import { feedItemVariants } from "../../lib/motionVariants";

export function EmptyState() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={feedItemVariants}
      className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8"
    >
      <p className="text-lg font-bold tracking-[0.08em] text-nominal">ALL CLEAR</p>
      <p className="mt-1 text-sm text-ink-dim">No incidents on the wire.</p>
    </motion.div>
  );
}
