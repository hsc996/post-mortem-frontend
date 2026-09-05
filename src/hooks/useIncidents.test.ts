import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IncidentDto, UserDto } from "../lib/incidentsApi";
import * as api from "../lib/incidentsApi";
import { ConflictError } from "../lib/incidentsApi";
import { useIncidents } from "./useIncidents";

vi.mock("../lib/incidentsApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/incidentsApi")>();
  return {
    ...actual,
    listUsers: vi.fn(),
    listIncidents: vi.fn(),
    getMitigation: vi.fn(),
    getIncident: vi.fn(),
    claimIncident: vi.fn(),
    resolveIncident: vi.fn(),
    clearMitigation: vi.fn(),
    createMitigation: vi.fn(),
    fetchAuditLog: vi.fn(),
  };
});

const users: UserDto[] = [{ id: "u1", first_name: "Hannah", last_name: "Scaife" }];

const openIncident: IncidentDto = {
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

beforeEach(() => {
  vi.mocked(api.listUsers).mockResolvedValue(users);
  vi.mocked(api.listIncidents).mockResolvedValue([openIncident]);
  vi.mocked(api.fetchAuditLog).mockResolvedValue([]);
});

describe("useIncidents", () => {
  it("loads and maps incidents with resolved names on mount", async () => {
    const { result } = renderHook(() => useIncidents("tok"));

    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    expect(result.current.incidents).toHaveLength(1);
    expect(result.current.incidents![0].reporterName).toBe("H. SCAIFE");
    expect(result.current.loadError).toBeNull();
  });

  it("surfaces a load failure via loadError instead of throwing", async () => {
    vi.mocked(api.listIncidents).mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useIncidents("tok"));

    await waitFor(() => expect(result.current.loadError).toBe("network down"));
    expect(result.current.incidents).toBeNull();
  });

  it("claim: on success, patches the incident in place and returns ok", async () => {
    vi.mocked(api.claimIncident).mockResolvedValue({ ...openIncident, version: 2, assignee_id: "u1" });
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let outcome;
    await act(async () => {
      outcome = await result.current.claim("i1", 1, "u1");
    });

    expect(outcome).toMatchObject({ ok: true });
    expect(result.current.incidents![0].assigneeName).toBe("H. SCAIFE");
    expect(result.current.incidents![0].version).toBe(2);
  });

  it("claim: on a real 409, returns a conflict result with the backend's version numbers — the core repro", async () => {
    vi.mocked(api.claimIncident).mockRejectedValue(
      new ConflictError("Conflict: ... Expected version 1, but current version is 2.", 1, 2),
    );
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let outcome;
    await act(async () => {
      outcome = await result.current.claim("i1", 1, "u1");
    });

    expect(outcome).toEqual({ ok: false, kind: "conflict", expected: 1, current: 2 });
    // A conflicting claim must never silently mutate local state.
    expect(result.current.incidents![0].version).toBe(1);
  });

  it("resolve: a domain-rule 400 (active mitigation) surfaces as 'blocked', not 'conflict'", async () => {
    vi.mocked(api.resolveIncident).mockRejectedValue(
      Object.assign(new Error("Cannot resolve an incident with an active mitigation."), { status: 400 }),
    );
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let outcome;
    await act(async () => {
      outcome = await result.current.resolve("i1");
    });

    expect(outcome).toMatchObject({ ok: false, kind: "blocked" });
  });

  it("applyMitigation: on success, refetches the incident and patches the mapped mitigation in place", async () => {
    vi.mocked(api.createMitigation).mockResolvedValue({
      id: "m1",
      incident_id: "i1",
      summary: "Pinned previous cert chain",
      ttl_minutes: 60,
      applied_at: "2026-01-01T00:00:00Z",
      applied_by_id: "u1",
      is_expired: false,
    });
    vi.mocked(api.getIncident).mockResolvedValue({ ...openIncident, status: "mitigated", version: 2 });
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let outcome;
    await act(async () => {
      outcome = await result.current.applyMitigation("i1", "Pinned previous cert chain", 60);
    });

    expect(outcome).toMatchObject({ ok: true });
    expect(result.current.incidents![0].status).toBe("mitigated");
    expect(result.current.incidents![0].mitigation).toMatchObject({
      summary: "Pinned previous cert chain",
      ttlMinutes: 60,
      appliedByName: "H. SCAIFE",
    });
  });

  it("applyMitigation: a real 409 (mitigation already exists) surfaces as 'blocked', not 'conflict'", async () => {
    vi.mocked(api.createMitigation).mockRejectedValue(
      Object.assign(new Error("An active mitigation already exists for this incident."), { status: 409 }),
    );
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let outcome;
    await act(async () => {
      outcome = await result.current.applyMitigation("i1", "Some fix", 60);
    });

    expect(outcome).toMatchObject({ ok: false, kind: "blocked" });
  });

  it("refreshIncident: does a real server refetch and patches local state, unlike a stale local read", async () => {
    vi.mocked(api.getIncident).mockResolvedValue({ ...openIncident, version: 5, assignee_id: "u1" });
    const { result } = renderHook(() => useIncidents("tok"));
    await waitFor(() => expect(result.current.incidents).not.toBeNull());

    let fresh;
    await act(async () => {
      fresh = await result.current.refreshIncident("i1");
    });

    expect(fresh).toMatchObject({ version: 5, assigneeName: "H. SCAIFE" });
    expect(result.current.incidents![0].version).toBe(5);
  });
});
