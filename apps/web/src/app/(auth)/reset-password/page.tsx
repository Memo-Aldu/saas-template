import { ResetPasswordCard } from "@/components/auth/reset-password-card";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();

  return <ResetPasswordCard />;
}
