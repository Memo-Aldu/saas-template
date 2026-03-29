import "server-only";

import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { refreshCredentialsSession } from "@/lib/auth/cognito";
import { normalizeCognitoTokens } from "@/lib/auth/cognito-tokens";
import { env } from "@/lib/env";

type RefreshableToken = {
  accessTokenExpiresAt?: number;
  authStrategy?: "credentials" | "oauth";
  email?: string | null;
  error?: "RefreshAccessTokenError";
  groups?: string[];
  idToken?: string;
  name?: string | null;
  refreshToken?: string;
  username?: string | null;
};

export async function refreshAccessToken(token: RefreshableToken) {
  if (!token.refreshToken) {
    return { error: "RefreshAccessTokenError" as const };
  }

  if (token.authStrategy === "credentials") {
    try {
      const refreshed = await refreshCredentialsSession(token.refreshToken);
      return {
        ...refreshed,
        email: refreshed.email ?? token.email,
        error: undefined,
        groups: refreshed.groups.length > 0 ? refreshed.groups : token.groups,
        idToken: refreshed.idToken ?? token.idToken,
        name: refreshed.name ?? token.name,
        username: refreshed.username ?? token.username,
      };
    } catch {
      return { error: "RefreshAccessTokenError" as const };
    }
  }

  const domain = env.cognito.domain.replace(/^https?:\/\//, "");
  const response = await fetch(`https://${domain}/oauth2/token`, {
    body: new URLSearchParams({
      client_id: env.cognito.clientId,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    return { error: "RefreshAccessTokenError" as const };
  }

  const refreshedTokens = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    id_token?: string;
    refresh_token?: string;
  };

  const refreshed = normalizeCognitoTokens({
    accessToken: refreshedTokens.access_token,
    expiresIn: refreshedTokens.expires_in,
    idToken: refreshedTokens.id_token,
    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
  });

  return {
    ...refreshed,
    email: refreshed.email ?? token.email,
    error: undefined,
    groups: refreshed.groups.length > 0 ? refreshed.groups : token.groups,
    idToken: refreshed.idToken ?? token.idToken,
    name: refreshed.name ?? token.name,
    username: refreshed.username ?? token.username,
  };
}

export async function getServerAuthToken(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: env.nextAuth.secret,
  });

  if (!token) {
    return null;
  }

  if (
    typeof token.accessTokenExpiresAt === "number" &&
    Date.now() < token.accessTokenExpiresAt - 30_000
  ) {
    return token;
  }

  if (!token.refreshToken) {
    return {
      ...token,
      error: "RefreshAccessTokenError" as const,
    };
  }

  const refreshed = await refreshAccessToken({
    authStrategy: token.authStrategy,
    email: token.email,
    groups: token.groups,
    idToken: token.idToken,
    name: token.name,
    refreshToken: token.refreshToken,
    username: token.username,
  });

  return {
    ...token,
    ...refreshed,
  };
}
