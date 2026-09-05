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
  description: string;
  serviceName: string;
  severity: Severity;
  status: Status;
  version: number;
  reporterName: string;
  assigneeName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  mitigation: Mitigation | null;
}

export type AuditAction =
  | "INCIDENT_CREATED"
  | "INCIDENT_UPDATED"
  | "INCIDENT_RESOLVED"
  | "MITIGATION_CREATED"
  | "MITIGATION_DELETED";

export interface AuditEntry {
  id: string;
  incidentId: string;
  action: AuditAction;
  actorName: string;
  occurredAt: string;
  detail?: string;
}

/** System-wide audit entry — spans incidents, mitigations, and users, so `action`/`entityType` aren't restricted to the incident-scoped AuditAction union. */
export interface GlobalAuditEntry {
  id: string;
  entityType: string;
  entityLabel: string;
  action: string;
  actorName: string;
  occurredAt: string;
  detail?: string;
}
