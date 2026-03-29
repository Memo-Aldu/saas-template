import type { NextRequest } from "next/server";
import { z } from "zod";

import { CurrentUserResponseSchema } from "@saas-template/contracts";
import {
  proxyBackendJson,
  safeParseJson,
  zodErrorToResponse,
} from "@/lib/api/backend-proxy";
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

  try {
    const response = await proxyBackendJson(request, {
      authorization: `Bearer ${token.idToken}`,
      requireAuth: true,
      upstreamPath: "/skeleton/me",
    });

    if (!response.ok) {
      return response;
    }

    const text = await response.text();
    const json = safeParseJson(text);
    const parsed = CurrentUserResponseSchema.safeParse(json);
    if (!parsed.success) {
      return zodErrorToResponse(parsed.error);
    }

    return Response.json(parsed.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorToResponse(error);
    }

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unable to load the authenticated backend identity.",
      500,
      "internal_server_error",
    );
  }
}
