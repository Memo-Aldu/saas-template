import { AuthShell } from "@saas-template/ui";

import { AuthPageFrame } from "@/components/auth/auth-page-frame";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthShell>
      <AuthPageFrame>{children}</AuthPageFrame>
    </AuthShell>
  );
}
