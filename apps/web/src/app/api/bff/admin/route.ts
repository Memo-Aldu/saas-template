import type { NextRequest } from "next/server";

import { proxyBackendJson } from "@/lib/api/backend-proxy";
import { getServerAuthToken } from "@/lib/auth/token";
import { jsonError } from "@/lib/http/json-route";

export async function GET(request: NextRequest) {
  const token = await getServerAuthToken(request);

  if (token?.error === "RefreshAccessTokenError") {
    return jsonError(
      "Your session ended. Please sign in again.",
      401,
      "session_expired",
    );
  }

  if (!token?.idToken) {
    return jsonError(
      "Authentication is required for this endpoint.",
      401,
      "unauthorized",
    );
  }

  return proxyBackendJson(request, {
    authorization: `Bearer ${token.idToken}`,
    requireAuth: true,
    upstreamPath: "/skeleton/admin",
  });
}
