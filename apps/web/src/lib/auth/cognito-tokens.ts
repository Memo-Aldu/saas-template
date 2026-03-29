type TokenClaims = {
  email?: string;
  exp?: number;
  "cognito:groups"?: string[] | string;
  "cognito:username"?: string;
  name?: string;
  sub?: string;
  username?: string;
};

export type NormalizedCognitoTokens = {
  accessToken?: string;
  accessTokenExpiresAt?: number;
  email?: string | null;
  groups: string[];
  idToken?: string;
  name?: string | null;
  refreshToken?: string;
  username?: string | null;
};

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function normalizeGroups(groups: TokenClaims["cognito:groups"]) {
  if (!groups) {
    return [];
  }

  if (Array.isArray(groups)) {
    return groups.map((group) => group.trim().toLowerCase()).filter(Boolean);
  }

  return groups
    .split(",")
    .map((group) => group.trim().toLowerCase())
    .filter(Boolean);
}

export function decodeTokenClaims(token?: string): TokenClaims {
  if (!token) {
    return {};
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return {};
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1] ?? ""));
  } catch {
    return {};
  }
}

export function normalizeCognitoTokens(input: {
  accessToken?: string;
  expiresAt?: number;
  expiresIn?: number;
  idToken?: string;
  refreshToken?: string;
}): NormalizedCognitoTokens {
  const accessTokenClaims = decodeTokenClaims(input.accessToken);
  const idTokenClaims = decodeTokenClaims(input.idToken);
  const expiresAtFromClaims = accessTokenClaims.exp
    ? accessTokenClaims.exp * 1000
    : idTokenClaims.exp
      ? idTokenClaims.exp * 1000
      : undefined;
  const expiresAtFromInput = input.expiresAt
    ? input.expiresAt * 1000
    : undefined;
  const expiresAtFromLifetime = input.expiresIn
    ? Date.now() + input.expiresIn * 1000
    : undefined;

  return {
    accessToken: input.accessToken,
    accessTokenExpiresAt:
      expiresAtFromClaims ?? expiresAtFromInput ?? expiresAtFromLifetime,
    email: idTokenClaims.email ?? null,
    groups: normalizeGroups(
      idTokenClaims["cognito:groups"] ?? accessTokenClaims["cognito:groups"],
    ),
    idToken: input.idToken,
    name: idTokenClaims.name ?? null,
    refreshToken: input.refreshToken,
    username:
      idTokenClaims["cognito:username"] ??
      idTokenClaims.username ??
      accessTokenClaims["cognito:username"] ??
      accessTokenClaims.username ??
      null,
  };
}
