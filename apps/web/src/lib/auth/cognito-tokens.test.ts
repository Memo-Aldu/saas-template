import { describe, expect, it } from "vitest";

import {
  decodeTokenClaims,
  normalizeCognitoTokens,
  normalizeGroups,
} from "./cognito-tokens";

function createToken(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

describe("normalizeGroups", () => {
  it("normalizes arrays and strings into lowercase groups", () => {
    expect(normalizeGroups(["Admin", " Hiring "])).toEqual(["admin", "hiring"]);
    expect(normalizeGroups("Admin, Hiring")).toEqual(["admin", "hiring"]);
  });
});

describe("decodeTokenClaims", () => {
  it("returns claims from the id token payload", () => {
    const token = createToken({
      email: "jane@example.com",
      "cognito:username": "jane",
    });

    expect(decodeTokenClaims(token)).toMatchObject({
      email: "jane@example.com",
      "cognito:username": "jane",
    });
  });
});

describe("normalizeCognitoTokens", () => {
  it("maps cognito tokens into app session fields", () => {
    const accessToken = createToken({
      exp: Math.floor(Date.now() / 1000) + 3600,
      "cognito:groups": ["Admin"],
      username: "jane",
    });
    const idToken = createToken({
      email: "jane@example.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
      name: "Jane Doe",
      "cognito:groups": ["Admin"],
      "cognito:username": "jane",
    });

    const result = normalizeCognitoTokens({
      accessToken,
      expiresIn: 3600,
      idToken,
      refreshToken: "refresh-token",
    });

    expect(result).toMatchObject({
      accessToken,
      email: "jane@example.com",
      groups: ["admin"],
      idToken,
      name: "Jane Doe",
      refreshToken: "refresh-token",
      username: "jane",
    });
    expect(result.accessTokenExpiresAt).toBeTypeOf("number");
  });

  it("falls back to expiresIn when the id token has no exp claim", () => {
    const token = createToken({
      email: "jane@example.com",
      name: "Jane Doe",
    });

    const before = Date.now();
    const result = normalizeCognitoTokens({
      accessToken: "access-token",
      expiresIn: 3600,
      idToken: token,
    });

    expect(result.accessTokenExpiresAt).toBeGreaterThanOrEqual(
      before + 3_590_000,
    );
  });

  it("falls back to access token claims for groups and expiry", () => {
    const accessToken = createToken({
      exp: Math.floor(Date.now() / 1000) + 1200,
      "cognito:groups": ["Admin"],
      username: "jane",
    });

    const result = normalizeCognitoTokens({
      accessToken,
      idToken: createToken({
        email: "jane@example.com",
        name: "Jane Doe",
      }),
    });

    expect(result.groups).toEqual(["admin"]);
    expect(result.username).toBe("jane");
    expect(result.accessTokenExpiresAt).toBeTypeOf("number");
  });
});
