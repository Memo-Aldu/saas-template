import { env } from "@/lib/env";

export function buildCognitoLogoutUrl() {
  const domain = env.cognito.domain.replace(/^https?:\/\//, "");
  const url = new URL(`https://${domain}/logout`);
  url.searchParams.set("client_id", env.cognito.clientId);
  url.searchParams.set("logout_uri", env.cognito.logoutUri);
  return url.toString();
}
