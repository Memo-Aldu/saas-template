import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = new Set([
  "/forgot-password",
  "/login",
  "/reset-password",
  "/signup",
  "/verify-email",
]);

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/dashboard") &&
    (!token || token.error === "RefreshAccessTokenError")
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    if (token?.error === "RefreshAccessTokenError") {
      loginUrl.searchParams.set("error", "RefreshAccessTokenError");
    }
    return NextResponse.redirect(loginUrl);
  }

  if (
    AUTH_ROUTES.has(pathname) &&
    token &&
    token.error !== "RefreshAccessTokenError"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forgot-password",
    "/login",
    "/reset-password",
    "/signup",
    "/verify-email",
  ],
};
