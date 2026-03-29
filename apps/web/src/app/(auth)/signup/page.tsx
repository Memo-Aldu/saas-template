import { SignUpCard } from "@/components/auth/signup-card";
import { redirectIfAuthenticated } from "@/lib/auth/session";
import { isAppleAuthEnabled, isGoogleAuthEnabled } from "@/lib/env";

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <SignUpCard
      socialProviders={{
        apple: isAppleAuthEnabled(),
        google: isGoogleAuthEnabled(),
      }}
    />
  );
}
