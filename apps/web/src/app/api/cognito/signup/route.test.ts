import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/cognito", () => ({
  signUpWithCognito: vi.fn(),
}));

import { POST } from "./route";

describe("POST /api/cognito/signup", () => {
  it("returns a controlled 400 for malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/cognito/signup", {
        body: "{not-json",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "invalid_json",
    });
  });

  it("returns a validation error envelope for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/cognito/signup", {
        body: JSON.stringify({
          email: "not-an-email",
          name: "A",
          password: "short",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "validation_error",
    });
  });
});
