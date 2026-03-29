import Link from "next/link";
import {
  AppShell,
  AppShellBody,
  AppShellHeader,
  Button,
} from "@saas-template/ui";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireAppSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAppSession();

  return (
    <AppShell>
      <AppShellHeader>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <BrandMark />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </AppShellHeader>
      <AppShellBody>{children}</AppShellBody>
    </AppShell>
  );
}
