import "server-only";

import { CurrentUserResponseSchema } from "@saas-template/contracts";

import { env } from "@/lib/env";

import { fetchContract } from "./client";

export async function getCurrentUserProfile(idToken: string) {
  if (!env.apiBaseUrl) {
    return null;
  }

  return fetchContract(
    `${env.apiBaseUrl}/skeleton/me`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
    CurrentUserResponseSchema,
  );
}
