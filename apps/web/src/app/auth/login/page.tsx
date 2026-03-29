import { redirect } from "next/navigation";

type LegacyLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyLoginPage({
  searchParams,
}: LegacyLoginPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      next.set(key, value);
    }
  }

  const query = next.toString();
  redirect(query ? `/login?${query}` : "/login");
}
