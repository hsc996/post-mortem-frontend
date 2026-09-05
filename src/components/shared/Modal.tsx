import { useEffect, useId, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";

/**
 * The one modal shell for the whole app — every modal (invite user, file
 * incident, and whatever comes next) shares this exact backdrop fade and
 * card spring, so "does this feel consistent" is answered by construction
 * rather than by eyeballing two components that happen to look similar.
 */
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeLabel?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, closeLabel, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="presentation"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-5"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto border border-rule bg-paper-raised md:max-w-lg"
          >
            <motion.div initial="hidden" animate="show" variants={feedContainerVariants} className="flex flex-col">
              <motion.div
                variants={feedItemVariants}
                className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4"
              >
                <h2 id={titleId} className="font-title text-lg font-semibold text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeLabel ?? `Close ${title.toLowerCase()}`}
                  className="inline-flex min-h-11 items-center text-xs font-semibold tracking-[0.1em] text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
                >
                  CLOSE
                </button>
              </motion.div>

              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
