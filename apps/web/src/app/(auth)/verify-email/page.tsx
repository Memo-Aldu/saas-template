import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export default async function VerifyEmailPage() {
  await redirectIfAuthenticated();

  return <VerifyEmailCard />;
}
