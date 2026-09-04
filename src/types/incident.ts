export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "open" | "mitigated" | "resolved";

export const PRECEDENCE: Record<Severity, string> = {
  critical: "FLASH",
  high: "URGENT",
  medium: "BULLETIN",
  low: "ROUTINE",
};

export interface Mitigation {
  summary: string;
  ttlMinutes: number;
  appliedAt: string;
  appliedByName: string;
}

export interface Incident {
  id: string;
  title: string;
  serviceName: string;
  severity: Severity;
  status: Status;
  reporterName: string;
  assigneeName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  mitigation: Mitigation | null;
}
