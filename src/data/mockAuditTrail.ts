import type { AuditEntry, Incident } from "../types/incident";
import { createId } from "../lib/id";

/**
 * Derives each incident's audit history from its own fields rather than
 * hand-authoring a parallel array that can drift out of sync with
 * mockIncidents.ts — every entry traces back to a real field on the
 * incident it belongs to.
 */
export function buildAuditTrail(incident: Incident): AuditEntry[] {
  const entries: AuditEntry[] = [
    {
      id: createId("audit"),
      incidentId: incident.id,
      action: "INCIDENT_CREATED",
      actorName: incident.reporterName,
      occurredAt: incident.createdAt,
      detail: `${incident.severity.toUpperCase()} severity, reported against ${incident.serviceName}`,
    },
  ];

  if (incident.assigneeName) {
    entries.push({
      id: createId("audit"),
      incidentId: incident.id,
      action: "INCIDENT_UPDATED",
      actorName: incident.assigneeName,
      occurredAt: incident.mitigation?.appliedAt ?? incident.resolvedAt ?? incident.createdAt,
      detail: `Claimed by ${incident.assigneeName}`,
    });
  }

  if (incident.mitigation) {
    entries.push({
      id: createId("audit"),
      incidentId: incident.id,
      action: "MITIGATION_CREATED",
      actorName: incident.mitigation.appliedByName,
      occurredAt: incident.mitigation.appliedAt,
      detail: `${incident.mitigation.summary} (TTL ${incident.mitigation.ttlMinutes}m)`,
    });
  }

  if (incident.status === "resolved" && incident.resolvedAt) {
    entries.push({
      id: createId("audit"),
      incidentId: incident.id,
      action: "INCIDENT_RESOLVED",
      actorName: incident.assigneeName ?? incident.reporterName,
      occurredAt: incident.resolvedAt,
      detail: "Marked resolved",
    });
  }

  return entries.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function buildAllAuditTrails(incidents: Incident[]): Record<string, AuditEntry[]> {
  return Object.fromEntries(incidents.map((incident) => [incident.id, buildAuditTrail(incident)]));
}
