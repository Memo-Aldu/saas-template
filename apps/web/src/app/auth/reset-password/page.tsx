import { redirect } from "next/navigation";

type LegacyResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyResetPasswordPage({
  searchParams,
}: LegacyResetPasswordPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      next.set(key, value);
    }
  }

  const query = next.toString();
  redirect(query ? `/reset-password?${query}` : "/reset-password");
}
