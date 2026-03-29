import { AuthShell } from "@saas-template/ui";

import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { LogoutRedirect } from "@/components/auth/logout-redirect";
import { buildCognitoLogoutUrl } from "@/lib/auth/logout";

export default function LogoutPage() {
  return (
    <AuthShell>
      <AuthPageFrame
        title="See you soon"
        description="A simple sign-out screen you can reuse across product templates."
      >
        <LogoutRedirect logoutUrl={buildCognitoLogoutUrl()} />
      </AuthPageFrame>
    </AuthShell>
  );
}
