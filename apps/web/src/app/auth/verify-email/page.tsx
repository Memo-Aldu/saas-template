import { redirect } from "next/navigation";

type LegacyVerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyVerifyEmailPage({
  searchParams,
}: LegacyVerifyEmailPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      next.set(key, value);
    }
  }

  const query = next.toString();
  redirect(query ? `/verify-email?${query}` : "/verify-email");
}
