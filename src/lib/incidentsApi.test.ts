import { describe, expect, it, vi } from "vitest";
import * as apiClient from "./apiClient";
import {
  claimIncident,
  ConflictError,
  createIncident,
  createMitigation,
  editIncident,
  getMitigation,
  resolveIncident,
} from "./incidentsApi";

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("incidentsApi conflict parsing", () => {
  it("turns a real 409 detail message into a ConflictError with the right numbers", async () => {
    vi.spyOn(apiClient, "authFetch").mockResolvedValue(
      fakeResponse(409, {
        detail:
          "Conflict: Incident was updated by another request. Expected version 3, but current version is 5.",
      }),
    );

    await expect(claimIncident("tok", "id1", "user1", 3)).rejects.toMatchObject({
      expected: 3,
      current: 5,
    });
    await expect(claimIncident("tok", "id1", "user1", 3)).rejects.toBeInstanceOf(ConflictError);
  });

  it("falls back to a plain ApiError if a 409 body doesn't match the expected shape", async () => {
    vi.spyOn(apiClient, "authFetch").mockResolvedValue(fakeResponse(409, { detail: "Something else entirely." }));

    await expect(resolveIncident("tok", "id1")).rejects.toMatchObject({
      status: 409,
      message: "Something else entirely.",
    });
    await expect(resolveIncident("tok", "id1")).rejects.not.toBeInstanceOf(ConflictError);
  });

  it("surfaces the real backend's blocked-resolve message as a plain ApiError", async () => {
    vi.spyOn(apiClient, "authFetch").mockResolvedValue(
      fakeResponse(400, {
        detail:
          "Cannot resolve an incident with an active mitigation. Clear the mitigation first via DELETE /incidents/{incident_id}/mitigation.",
      }),
    );

    await expect(resolveIncident("tok", "id1")).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining("active mitigation"),
    });
  });

  it("treats a 404 on GET mitigation as 'no active mitigation', not an error", async () => {
    vi.spyOn(apiClient, "authFetch").mockResolvedValue(fakeResponse(404, { detail: "not found" }));

    await expect(getMitigation("tok", "id1")).resolves.toBeNull();
  });

  it("createMitigation POSTs the snake_case body to the right URL", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(
      fakeResponse(201, {
        id: "m1",
        incident_id: "id1",
        summary: "Pinned previous cert chain",
        ttl_minutes: 90,
        applied_at: "2026-01-01T00:00:00Z",
        applied_by_id: "u1",
        is_expired: false,
      }),
    );

    const result = await createMitigation("tok", "id1", { summary: "Pinned previous cert chain", ttlMinutes: 90 });

    expect(authFetch).toHaveBeenCalledWith(
      "tok",
      "/incidents/id1/mitigation/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ summary: "Pinned previous cert chain", ttl_minutes: 90 }),
      }),
    );
    expect(result.ttl_minutes).toBe(90);
  });

  it("editIncident PATCHes only the changed fields plus version, in snake_case", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(
      fakeResponse(200, {
        id: "i1",
        title: "Checkout down entirely",
        description: "desc",
        service_name: "payments-api",
        severity: "critical",
        status: "open",
        version: 2,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        resolved_at: null,
        mttr_seconds: null,
        reporter_id: "u1",
        assignee_id: null,
      }),
    );

    await editIncident("tok", "i1", { title: "Checkout down entirely" }, 1);

    expect(authFetch).toHaveBeenCalledWith(
      "tok",
      "/incidents/i1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ title: "Checkout down entirely", version: 1 }),
      }),
    );
  });

  const fakeIncidentDto = {
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

  it("createIncident omits assignee_id from the body when not provided", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(fakeResponse(201, fakeIncidentDto));

    await createIncident("tok", {
      title: "Checkout failing",
      description: "desc",
      serviceName: "payments-api",
      severity: "critical",
    });

    const body = JSON.parse((authFetch.mock.calls[0][2] as RequestInit).body as string);
    expect(body).not.toHaveProperty("assignee_id");
  });

  it("createIncident includes assignee_id in the body when provided", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(fakeResponse(201, fakeIncidentDto));

    await createIncident("tok", {
      title: "Checkout failing",
      description: "desc",
      serviceName: "payments-api",
      severity: "critical",
      assigneeId: "u2",
    });

    const body = JSON.parse((authFetch.mock.calls[0][2] as RequestInit).body as string);
    expect(body.assignee_id).toBe("u2");
  });
});
