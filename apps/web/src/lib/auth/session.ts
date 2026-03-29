import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "./config";
import { getSafeCallbackUrl } from "./redirect";

export async function getAppSession() {
  return getServerSession(authOptions);
}

export async function requireAppSession() {
  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }

  if (session.error === "RefreshAccessTokenError") {
    redirect("/login?error=RefreshAccessTokenError");
  }

  return session;
}

export async function redirectIfAuthenticated(callbackUrl?: string | null) {
  const session = await getAppSession();
  if (!session || session.error === "RefreshAccessTokenError") {
    return;
  }

  redirect(getSafeCallbackUrl(callbackUrl));
}
