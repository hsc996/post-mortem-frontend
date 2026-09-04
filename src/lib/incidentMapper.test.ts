import { describe, expect, it } from "vitest";
import { buildUserMap, mapAuditEntry, mapIncident, mapMitigation } from "./incidentMapper";
import type { AuditLogDto, IncidentDto, MitigationDto, UserDto } from "./incidentsApi";

const users: UserDto[] = [
  { id: "u1", first_name: "Rafael", last_name: "Okafor" },
  { id: "u2", first_name: "teresa", last_name: "Álvarez" },
];
const userMap = buildUserMap(users);

const baseIncidentDto: IncidentDto = {
  id: "i1",
  title: "Checkout failing",
  description: "desc",
  service_name: "payments-api",
  severity: "critical",
  status: "open",
  version: 1,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  resolved_at: null,
  mttr_seconds: null,
  reporter_id: "u1",
  assignee_id: null,
};

describe("buildUserMap / wire-name formatting", () => {
  it("formats names as 'F. LASTNAME' regardless of source casing", () => {
    expect(userMap.get("u1")).toBe("R. OKAFOR");
    expect(userMap.get("u2")).toBe("T. ÁLVAREZ");
  });
});

describe("mapIncident", () => {
  it("resolves reporter and assignee names from the user map", () => {
    const incident = mapIncident({ ...baseIncidentDto, assignee_id: "u2" }, userMap, null);
    expect(incident.reporterName).toBe("R. OKAFOR");
    expect(incident.assigneeName).toBe("T. ÁLVAREZ");
  });

  it("leaves assigneeName null when unassigned, not a placeholder string", () => {
    const incident = mapIncident(baseIncidentDto, userMap, null);
    expect(incident.assigneeName).toBeNull();
  });

  it("falls back to UNKNOWN for a reporter id missing from the user map, rather than throwing", () => {
    const incident = mapIncident({ ...baseIncidentDto, reporter_id: "ghost" }, userMap, null);
    expect(incident.reporterName).toBe("UNKNOWN");
  });

  it("carries a passed-in mitigation through unchanged", () => {
    const mitigation = { summary: "Rolled back", ttlMinutes: 30, appliedAt: "x", appliedByName: "R. OKAFOR" };
    const incident = mapIncident(baseIncidentDto, userMap, mitigation);
    expect(incident.mitigation).toBe(mitigation);
  });
});

describe("mapMitigation", () => {
  it("resolves applied_by_id to a wire name", () => {
    const dto: MitigationDto = {
      id: "m1",
      incident_id: "i1",
      summary: "Pinned cert chain",
      ttl_minutes: 90,
      applied_at: "2026-01-01T00:00:00Z",
      applied_by_id: "u2",
      is_expired: false,
    };
    expect(mapMitigation(dto, userMap).appliedByName).toBe("T. ÁLVAREZ");
  });
});

describe("mapAuditEntry", () => {
  const baseAudit: AuditLogDto = {
    id: "a1",
    entity_type: "incident",
    entity_id: "i1",
    action: "INCIDENT_CREATED",
    actor_id: "u1",
    changes: {},
    ip_address: null,
    incident_id: "i1",
    created_at: "2026-01-01T00:00:00Z",
  };

  it("derives the INCIDENT_CREATED detail from severity + service_name in changes", () => {
    const entry = mapAuditEntry(
      { ...baseAudit, changes: { severity: "critical", service_name: "payments-api" } },
      userMap,
    );
    expect(entry?.detail).toBe("CRITICAL severity, reported against payments-api");
  });

  it("labels an INCIDENT_UPDATED entry as a claim only when assignee_id is present in changes", () => {
    const claimed = mapAuditEntry(
      { ...baseAudit, action: "INCIDENT_UPDATED", changes: { assignee_id: "u2" } },
      userMap,
    );
    expect(claimed?.detail).toBe("Claimed by R. OKAFOR");

    const otherUpdate = mapAuditEntry(
      { ...baseAudit, action: "INCIDENT_UPDATED", changes: { title: "New title" } },
      userMap,
    );
    expect(otherUpdate?.detail).toBeUndefined();
  });

  it("returns null for an action outside the known set instead of guessing", () => {
    const entry = mapAuditEntry({ ...baseAudit, action: "USER_ROLE_CHANGED" }, userMap);
    expect(entry).toBeNull();
  });

  it("resolves the actor name even when it's the target of the change (unknown actor id)", () => {
    const entry = mapAuditEntry({ ...baseAudit, actor_id: "ghost" }, userMap);
    expect(entry?.actorName).toBe("UNKNOWN");
  });
});
