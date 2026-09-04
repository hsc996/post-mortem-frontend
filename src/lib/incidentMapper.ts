import type { AuditAction, AuditEntry, Incident, Mitigation } from "../types/incident";
import type { AuditLogDto, IncidentDto, MitigationDto, UserDto } from "./incidentsApi";

/** "H. SCAIFE" — matches types/user.ts's wireName convention for the current user. */
function wireName(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}. ${lastName.toUpperCase()}`;
}

export type UserMap = Map<string, string>;

export function buildUserMap(users: UserDto[]): UserMap {
  return new Map(users.map((u) => [u.id, wireName(u.first_name, u.last_name)]));
}

const UNKNOWN_ACTOR = "UNKNOWN";

function resolveName(userMap: UserMap, id: string | null): string {
  if (!id) return UNKNOWN_ACTOR;
  return userMap.get(id) ?? UNKNOWN_ACTOR;
}

export function mapMitigation(dto: MitigationDto, userMap: UserMap): Mitigation {
  return {
    summary: dto.summary,
    ttlMinutes: dto.ttl_minutes,
    appliedAt: dto.applied_at,
    appliedByName: resolveName(userMap, dto.applied_by_id),
  };
}

export function mapIncident(dto: IncidentDto, userMap: UserMap, mitigation: Mitigation | null): Incident {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    serviceName: dto.service_name,
    severity: dto.severity,
    status: dto.status,
    version: dto.version,
    reporterName: resolveName(userMap, dto.reporter_id),
    assigneeName: dto.assignee_id ? resolveName(userMap, dto.assignee_id) : null,
    createdAt: dto.created_at,
    resolvedAt: dto.resolved_at,
    mitigation,
  };
}

function describeAuditEntry(action: string, changes: Record<string, unknown>, actorName: string): string | undefined {
  switch (action) {
    case "INCIDENT_CREATED": {
      const severity = typeof changes.severity === "string" ? changes.severity.toUpperCase() : null;
      const service = typeof changes.service_name === "string" ? changes.service_name : null;
      return severity && service ? `${severity} severity, reported against ${service}` : undefined;
    }
    case "INCIDENT_UPDATED":
      return "assignee_id" in changes ? `Claimed by ${actorName}` : undefined;
    case "INCIDENT_RESOLVED":
      return "Marked resolved";
    case "MITIGATION_CREATED": {
      const summary = typeof changes.summary === "string" ? changes.summary : null;
      const ttl = typeof changes.ttl_minutes === "number" ? changes.ttl_minutes : null;
      return summary && ttl ? `${summary} (TTL ${ttl}m)` : summary ?? undefined;
    }
    case "MITIGATION_DELETED":
      return "Mitigation cleared";
    default:
      return undefined;
  }
}

const KNOWN_ACTIONS = new Set<AuditAction>([
  "INCIDENT_CREATED",
  "INCIDENT_UPDATED",
  "INCIDENT_RESOLVED",
  "MITIGATION_CREATED",
  "MITIGATION_DELETED",
]);

export function mapAuditEntry(dto: AuditLogDto, userMap: UserMap): AuditEntry | null {
  if (!KNOWN_ACTIONS.has(dto.action as AuditAction)) return null;
  const actorName = resolveName(userMap, dto.actor_id);
  return {
    id: dto.id,
    incidentId: dto.incident_id ?? "",
    action: dto.action as AuditAction,
    actorName,
    occurredAt: dto.created_at,
    detail: describeAuditEntry(dto.action, dto.changes, actorName),
  };
}
