import "server-only";

import { z } from "zod";

import { ErrorEnvelopeSchema } from "@saas-template/contracts";

import { env } from "@/lib/env";
import { jsonError } from "@/lib/http/json-route";

function getApiBaseUrl() {
  return env.apiBaseUrl?.replace(/\/+$/, "") ?? null;
}

export async function proxyBackendJson(
  _request: Request,
  options: {
    authorization?: string;
    requireAuth?: boolean;
    upstreamPath: string;
  },
) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return jsonError(
      "APP_API_BASE_URL is not configured.",
      503,
      "service_unavailable",
    );
  }

  const response = await fetch(`${baseUrl}${options.upstreamPath}`, {
    cache: "no-store",
    headers: options.authorization
      ? {
          Authorization: options.authorization,
        }
      : undefined,
  });

  const text = await response.text();
  const json = text ? safeParseJson(text) : null;

  if (!response.ok) {
    const parsedError = ErrorEnvelopeSchema.safeParse(json);
    if (parsedError.success) {
      return jsonError(
        parsedError.data.message,
        response.status,
        parsedError.data.code,
        parsedError.data.details ?? undefined,
      );
    }

    return jsonError(
      options.requireAuth
        ? "Unable to reach the authenticated backend route."
        : "Unable to reach the backend route.",
      response.status,
      "upstream_error",
    );
  }

  return new Response(text || "{}", {
    headers: {
      "Content-Type": "application/json",
    },
    status: response.status,
  });
}

export function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function zodErrorToResponse(error: z.ZodError) {
  return jsonError(
    error.issues[0]?.message ??
      "The backend response did not match the expected contract.",
    502,
    "upstream_contract_error",
    error.issues.map((issue) => ({
      field:
        issue.path.length > 0
          ? issue.path.map((segment) => String(segment)).join(".")
          : null,
      reason: issue.message,
    })),
  );
}
