import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    error?: "RefreshAccessTokenError";
    provider?: string;
    user: DefaultSession["user"] & {
      groups: string[];
      username?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    email?: string | null;
    error?: "RefreshAccessTokenError";
    groups?: string[];
    idToken?: string;
    name?: string | null;
    authStrategy?: "credentials" | "oauth";
    provider?: string;
    refreshToken?: string;
    username?: string | null;
  }
}
