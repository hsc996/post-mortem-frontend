import type { Severity, Status } from "../types/incident";
import { ApiError, authFetch, parseError } from "./apiClient";

/** Raw backend shapes (src/schemas/*.py) — snake_case, IDs not names. */
export interface IncidentDto {
  id: string;
  title: string;
  description: string;
  service_name: string;
  severity: Severity;
  status: Status;
  version: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  mttr_seconds: number | null;
  reporter_id: string;
  assignee_id: string | null;
}

export interface MitigationDto {
  id: string;
  incident_id: string;
  summary: string;
  ttl_minutes: number;
  applied_at: string;
  applied_by_id: string;
  is_expired: boolean;
}

export interface AuditLogDto {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  changes: Record<string, unknown>;
  ip_address: string | null;
  incident_id: string | null;
  created_at: string;
}

/** GET /auth/users returns this in full for admins; everyone else gets only id/first_name/last_name. */
export interface UserDto {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active?: boolean;
}

/** A 409 from apply_optimistic_update — carries the two version numbers the backend compared. */
export class ConflictError extends ApiError {
  expected: number;
  current: number;
  constructor(message: string, expected: number, current: number) {
    super(message, 409);
    this.expected = expected;
    this.current = current;
  }
}

const CONFLICT_PATTERN = /Expected version (\d+), but current version is (\d+)/;

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 409) {
      try {
        await parseError(response);
      } catch (err) {
        if (err instanceof ApiError) {
          const match = err.message.match(CONFLICT_PATTERN);
          if (match) throw new ConflictError(err.message, Number(match[1]), Number(match[2]));
        }
        throw err;
      }
    }
    await parseError(response);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listIncidents(token: string): Promise<IncidentDto[]> {
  return handle<IncidentDto[]>(await authFetch(token, "/incidents/?limit=100"));
}

export async function getIncident(token: string, incidentId: string): Promise<IncidentDto> {
  return handle<IncidentDto>(await authFetch(token, `/incidents/${incidentId}`));
}

export async function listUsers(token: string): Promise<UserDto[]> {
  return handle<UserDto[]>(await authFetch(token, "/auth/users?limit=200"));
}

export interface IncidentCreateInput {
  title: string;
  description: string;
  serviceName: string;
  severity: Severity;
}

export async function createIncident(token: string, input: IncidentCreateInput): Promise<IncidentDto> {
  return handle<IncidentDto>(
    await authFetch(token, "/incidents/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        service_name: input.serviceName,
        severity: input.severity,
      }),
    }),
  );
}

export async function updateUserRole(token: string, userId: string, role: string): Promise<UserDto> {
  return handle<UserDto>(
    await authFetch(token, `/auth/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),
  );
}

export async function getMitigation(token: string, incidentId: string): Promise<MitigationDto | null> {
  const response = await authFetch(token, `/incidents/${incidentId}/mitigation/`);
  if (response.status === 404) return null;
  return handle<MitigationDto>(response);
}

export async function fetchAuditLog(token: string, incidentId: string): Promise<AuditLogDto[]> {
  return handle<AuditLogDto[]>(await authFetch(token, `/incidents/${incidentId}/audit-log`));
}

export interface GlobalAuditLogFilters {
  entityType?: string;
  actorId?: string;
  limit?: number;
}

export async function fetchGlobalAuditLog(token: string, filters: GlobalAuditLogFilters = {}): Promise<AuditLogDto[]> {
  const params = new URLSearchParams();
  if (filters.entityType) params.set("entity_type", filters.entityType);
  if (filters.actorId) params.set("actor_id", filters.actorId);
  params.set("limit", String(filters.limit ?? 100));
  return handle<AuditLogDto[]>(await authFetch(token, `/audit-logs/?${params.toString()}`));
}

export async function claimIncident(
  token: string,
  incidentId: string,
  assigneeId: string,
  version: number,
): Promise<IncidentDto> {
  return handle<IncidentDto>(
    await authFetch(token, `/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee_id: assigneeId, version }),
    }),
  );
}

export async function resolveIncident(token: string, incidentId: string): Promise<IncidentDto> {
  return handle<IncidentDto>(await authFetch(token, `/incidents/${incidentId}/resolve`, { method: "POST" }));
}

export async function clearMitigation(token: string, incidentId: string): Promise<void> {
  return handle<void>(await authFetch(token, `/incidents/${incidentId}/mitigation/`, { method: "DELETE" }));
}

export interface MitigationCreateInput {
  summary: string;
  ttlMinutes: number;
}

export async function createMitigation(
  token: string,
  incidentId: string,
  input: MitigationCreateInput,
): Promise<MitigationDto> {
  return handle<MitigationDto>(
    await authFetch(token, `/incidents/${incidentId}/mitigation/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: input.summary, ttl_minutes: input.ttlMinutes }),
    }),
  );
}
