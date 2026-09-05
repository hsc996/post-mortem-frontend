import { describe, expect, it, vi } from "vitest";
import * as apiClient from "./apiClient";
import { acceptInvite, createInvite, fetchInvitePreview, listInvites } from "./inviteApi";

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("inviteApi", () => {
  it("createInvite POSTs the email/role body to the right URL", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(
      fakeResponse(201, {
        id: "inv1",
        email: "newbie@example.com",
        role: "responder",
        expires_at: "2026-01-08T00:00:00Z",
        invite_link: "http://localhost:5173/invite/tok123",
      }),
    );

    const result = await createInvite("tok", "newbie@example.com", "responder");

    expect(authFetch).toHaveBeenCalledWith(
      "tok",
      "/auth/invites",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "newbie@example.com", role: "responder" }),
      }),
    );
    expect(result.invite_link).toBe("http://localhost:5173/invite/tok123");
  });

  it("listInvites GETs the admin invites list", async () => {
    const authFetch = vi.spyOn(apiClient, "authFetch").mockResolvedValue(fakeResponse(200, []));

    await listInvites("tok");

    expect(authFetch).toHaveBeenCalledWith("tok", "/auth/invites");
  });

  it("fetchInvitePreview returns the preview shape without an auth token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse(200, { email: "newbie@example.com", role: "viewer", expires_at: "2026-01-08T00:00:00Z" }),
    );

    const preview = await fetchInvitePreview("tok123");

    expect(preview.email).toBe("newbie@example.com");
    expect(preview.role).toBe("viewer");
  });

  it("fetchInvitePreview surfaces a 410 as an ApiError with that status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(fakeResponse(410, { detail: "Invite has expired." }));

    await expect(fetchInvitePreview("tok123")).rejects.toMatchObject({ status: 410 });
  });

  it("acceptInvite POSTs snake_case fields and returns the access token", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(fakeResponse(201, { access_token: "abc.def.ghi", token_type: "bearer" }));

    const token = await acceptInvite("tok123", { password: "Sup3rSecret!", firstName: "Alex", lastName: "Rivera" });

    expect(token).toBe("abc.def.ghi");
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ password: "Sup3rSecret!", first_name: "Alex", last_name: "Rivera" });
  });
});
