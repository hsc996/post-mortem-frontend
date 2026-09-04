import type { Variants } from "motion/react";

/**
 * The feed's data-mount entrance: a staggered spring rise, the same
 * vocabulary (spring type, stagger timing, opacity+y offset) used
 * throughout congenial-goggles-FE for softening a data render on mount.
 * Only plays once per row's own mount — a re-sort after a claim/resolve
 * doesn't replay it, since the row stays mounted and just reflows.
 */
export const feedContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export const feedItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};
