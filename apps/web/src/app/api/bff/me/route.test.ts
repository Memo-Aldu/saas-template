import { beforeEach, describe, expect, it, vi } from "vitest";

const { proxyBackendJson, getServerAuthToken } = vi.hoisted(() => ({
  proxyBackendJson: vi.fn(),
  getServerAuthToken: vi.fn(),
}));

vi.mock("@/lib/api/backend-proxy", () => ({
  proxyBackendJson,
  safeParseJson: (value: string) => JSON.parse(value),
  zodErrorToResponse: () =>
    Response.json(
      {
        code: "upstream_contract_error",
      },
      { status: 502 },
    ),
}));

vi.mock("@/lib/auth/token", () => ({
  getServerAuthToken,
}));

import { GET } from "./route";

describe("GET /api/bff/me", () => {
  beforeEach(() => {
    proxyBackendJson.mockReset();
    getServerAuthToken.mockReset();
  });

  it("requires an id token", async () => {
    getServerAuthToken.mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/bff/me") as never,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "unauthorized",
    });
  });

  it("forwards the id token to the backend", async () => {
    getServerAuthToken.mockResolvedValue({
      idToken: "id-token",
    });
    proxyBackendJson.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Authenticated user loaded.",
          data: {
            email: null,
            groups: ["admin"],
            subject: "user-123",
            username: "jane",
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        },
      ),
    );

    const response = await GET(
      new Request("http://localhost/api/bff/me") as never,
    );

    expect(proxyBackendJson).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        authorization: "Bearer id-token",
        upstreamPath: "/skeleton/me",
      }),
    );
    expect(response.status).toBe(200);
  });
});
