const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeCallbackUrl(
  callbackUrl?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT,
) {
  if (!callbackUrl) {
    return fallback;
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  return callbackUrl;
}

export function getAuthRedirectTarget(
  callbackUrl?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT,
) {
  return getSafeCallbackUrl(callbackUrl, fallback);
}
