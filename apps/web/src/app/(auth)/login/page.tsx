import { LoginCard } from "@/components/auth/login-card";
import {
  isAppleAuthEnabled,
  isCognitoDomainConfigured,
  isGoogleAuthEnabled,
} from "@/lib/env";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;

  await redirectIfAuthenticated(callbackUrl);

  return (
    <LoginCard
      authConfigured={isCognitoDomainConfigured()}
      socialProviders={{
        apple: isAppleAuthEnabled(),
        google: isGoogleAuthEnabled(),
      }}
    />
  );
}
