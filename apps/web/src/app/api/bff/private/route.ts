import type { NextRequest } from "next/server";

import { proxyBackendJson } from "@/lib/api/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendJson(request, {
    requireAuth: false,
    upstreamPath: "/skeleton/private",
  });
}
