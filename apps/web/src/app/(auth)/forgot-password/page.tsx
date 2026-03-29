import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { redirectIfAuthenticated } from "@/lib/auth/session";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return <ForgotPasswordCard />;
}
