import { BadgeCheck, Shield, Sparkles } from "lucide-react";
import { Button, StatePanel } from "@saas-template/ui";

type UserSummaryProps = {
  sessionIdentity: {
    email: string | null | undefined;
    groups: string[];
    name: string | null | undefined;
    username?: string | null;
  };
};

export function UserSummary({ sessionIdentity }: UserSummaryProps) {
  const effectiveIdentity = {
    email: sessionIdentity.email ?? null,
    groups: sessionIdentity.groups,
    username: sessionIdentity.username ?? null,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <StatePanel
        title={`Welcome${sessionIdentity.name ? `, ${sessionIdentity.name}` : ""}`}
        description="Your workspace is authenticated and ready for operations."
        actions={
          <Button asChild>
            <a href="/logout">Sign out</a>
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <BadgeCheck className="mb-3 size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="mt-1 font-medium">
              {effectiveIdentity.email ?? "Unknown email"}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <Shield className="mb-3 size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="mt-1 font-medium">
              {effectiveIdentity.username ?? "Not available"}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <Sparkles className="mb-3 size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Groups</p>
            <p className="mt-1 font-medium">
              {effectiveIdentity.groups.length > 0
                ? effectiveIdentity.groups.join(", ")
                : "No groups assigned"}
            </p>
          </div>
        </div>
      </StatePanel>
      <StatePanel
        title="Backend contract"
        description="Server-side routes can call the typed `/skeleton/me` contract without exposing raw bearer tokens to browser code."
      >
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Session identity is safe to render directly, while authenticated
            backend lookups should stay on the server side.
          </p>
          <p>
            This template keeps the browser session focused on user-facing
            identity and leaves raw Cognito tokens in server-only auth helpers.
          </p>
        </div>
      </StatePanel>
    </div>
  );
}
