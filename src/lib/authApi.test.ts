import { describe, expect, it, vi } from "vitest";
import { register } from "./authApi";

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("authApi", () => {
  it("register POSTs snake_case fields including account_name and returns the access token", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(fakeResponse(201, { access_token: "abc.def.ghi", token_type: "bearer" }));

    const token = await register({
      accountName: "Acme Corp",
      email: "founder@acme.com",
      password: "Sup3rSecret!",
      firstName: "Alex",
      lastName: "Rivera",
    });

    expect(token).toBe("abc.def.ghi");
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      account_name: "Acme Corp",
      email: "founder@acme.com",
      password: "Sup3rSecret!",
      first_name: "Alex",
      last_name: "Rivera",
    });
  });

  it("register surfaces a 400 (duplicate email) as an ApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse(400, { detail: "User with this email already exists." }),
    );

    await expect(
      register({
        accountName: "Acme Corp",
        email: "founder@acme.com",
        password: "Sup3rSecret!",
        firstName: "Alex",
        lastName: "Rivera",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
