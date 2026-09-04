import { PRECEDENCE, type Severity } from "../../types/incident";

const SCALE: Record<Severity, string> = {
  critical: "text-[15px] font-bold tracking-[0.08em] sm:text-base",
  high: "text-sm font-bold tracking-[0.08em]",
  medium: "text-sm font-semibold tracking-[0.06em]",
  low: "text-xs font-medium tracking-[0.06em] text-ink-dim",
};

/**
 * Severity reads through typography alone — weight and size, the wire
 * service's own precedence vocabulary — never through a color code.
 */
export function PrecedenceStamp({ severity }: { severity: Severity }) {
  return (
    <span className={`font-wire shrink-0 ${SCALE[severity]}`}>
      {PRECEDENCE[severity]}
    </span>
  );
}
