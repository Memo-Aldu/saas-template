import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import CredentialsProvider from "next-auth/providers/credentials";

import { signInWithCognito } from "@/lib/auth/cognito";
import {
  normalizeCognitoTokens,
  normalizeGroups,
} from "@/lib/auth/cognito-tokens";
import { refreshAccessToken } from "@/lib/auth/token";
import { env, getCognitoIssuer, getCognitoJwksEndpoint } from "@/lib/env";

type CognitoProfile = {
  email?: string;
  name?: string;
  picture?: string;
  sub: string;
  "cognito:groups"?: string[] | string;
  "cognito:username"?: string;
  username?: string;
};

type AuthenticatedUser = {
  accessToken?: string;
  accessTokenExpiresAt?: number;
  email?: string | null;
  groups?: string[];
  id: string;
  idToken?: string;
  name?: string | null;
  provider?: string;
  refreshToken?: string;
  username?: string | null;
};

function createCognitoProvider(): OAuthConfig<CognitoProfile> {
  const domain = env.cognito.domain.replace(/^https?:\/\//, "");
  const baseUrl = `https://${domain}`;

  return {
    id: "cognito",
    name: "Cognito",
    type: "oauth",
    clientId: env.cognito.clientId,
    authorization: {
      params: {
        scope: "openid email profile",
      },
      url: `${baseUrl}/oauth2/authorize`,
    },
    checks: ["pkce", "state", "nonce"],
    client: {
      token_endpoint_auth_method: "none",
    },
    issuer: getCognitoIssuer(),
    idToken: true,
    jwks_endpoint: getCognitoJwksEndpoint(),
    profile(profile: CognitoProfile) {
      return {
        email: profile.email,
        id: profile.sub,
        image: profile.picture ?? null,
        name: profile.name ?? profile.email ?? "SAAS Template User",
      };
    },
    token: `${baseUrl}/oauth2/token`,
    userinfo: `${baseUrl}/oauth2/userInfo`,
  };
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ account, profile, token, user }) {
      const cognitoProfile = profile as CognitoProfile | undefined;
      const authUser = user as AuthenticatedUser | undefined;

      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : undefined;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.authStrategy =
          account.provider === "credentials" ? "credentials" : "oauth";
        token.provider = account.provider;

        if (account.id_token) {
          const normalized = normalizeCognitoTokens({
            accessToken: account.access_token,
            expiresAt: account.expires_at,
            idToken: account.id_token,
            refreshToken: account.refresh_token,
          });

          token.email = normalized.email ?? token.email ?? null;
          token.groups =
            normalized.groups.length > 0 ? normalized.groups : token.groups;
          token.name = normalized.name ?? token.name ?? null;
          token.username = normalized.username ?? token.username ?? null;
        }
      }

      if (cognitoProfile) {
        token.email = cognitoProfile.email ?? token.email ?? null;
        token.groups = normalizeGroups(cognitoProfile["cognito:groups"]);
        token.name = cognitoProfile.name ?? token.name ?? null;
        token.username =
          cognitoProfile["cognito:username"] ??
          cognitoProfile.username ??
          token.username ??
          null;
      }

      if (user) {
        token.name = user.name ?? token.name ?? authUser?.name ?? null;
        token.email = user.email ?? token.email ?? authUser?.email ?? null;
        token.groups = authUser?.groups ?? token.groups ?? [];
        token.username = authUser?.username ?? token.username ?? null;
        token.accessToken = authUser?.accessToken ?? token.accessToken;
        token.accessTokenExpiresAt =
          authUser?.accessTokenExpiresAt ?? token.accessTokenExpiresAt;
        token.idToken = authUser?.idToken ?? token.idToken;
        token.refreshToken = authUser?.refreshToken ?? token.refreshToken;
        token.provider = authUser?.provider ?? token.provider;
        token.authStrategy =
          authUser?.provider === "credentials"
            ? "credentials"
            : token.authStrategy;
      }

      if (
        typeof token.accessTokenExpiresAt === "number" &&
        Date.now() < token.accessTokenExpiresAt - 30_000
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return token;
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
    },
    async redirect({ baseUrl, url }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {}

      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      session.error = token.error;
      session.user.email = token.email ?? session.user.email;
      session.user.groups = token.groups ?? [];
      session.user.name = token.name ?? session.user.name;
      session.user.username = token.username;
      session.provider = token.provider;
      return session;
    },
  },
  pages: {
    error: "/login",
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      id: "credentials",
      name: "Email and password",
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("CredentialsSignin");
        }

        try {
          const result = await signInWithCognito({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            accessToken: result.accessToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            email: result.email,
            groups: result.groups,
            id: result.username ?? result.email ?? credentials.email,
            idToken: result.idToken,
            name: result.name ?? result.email ?? credentials.email,
            provider: "credentials",
            refreshToken: result.refreshToken,
            username: result.username ?? credentials.email,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.name);
          }

          throw new Error("CredentialsSignin");
        }
      },
    }),
    createCognitoProvider(),
  ],
  secret: env.nextAuth.secret,
  session: {
    strategy: "jwt",
  },
};
