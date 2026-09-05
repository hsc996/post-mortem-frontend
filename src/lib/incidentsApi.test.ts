import { describe, expect, it, vi } from "vitest";
import * as apiClient from "./apiClient";
import { claimIncident, ConflictError, createMitigation, getMitigation, resolveIncident } from "./incidentsApi";

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
});
