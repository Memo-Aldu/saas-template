import {
  CircleDot,
  Globe,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { Button, StatePanel } from "@saas-template/ui";

import {
  BrowserShareChart,
  TrafficChannelsChart,
} from "@/components/dashboard-charts";
import { BackendIdentityCard } from "@/components/dashboard/backend-identity-card";
import { ApiEndpointTester } from "@/components/dashboard/api-endpoint-tester";
import { UserSummary } from "@/components/dashboard/user-summary";
import { requireAppSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export default async function DashboardPage() {
  const session = await requireAppSession();

  return (
    <div className="space-y-6">
      <UserSummary
        sessionIdentity={{
          email: session.user.email,
          groups: session.user.groups,
          name: session.user.name,
          username: session.user.username,
        }}
      />
      <div className="grid gap-6 xl:grid-cols-12">
        <StatePanel
          className="xl:col-span-4"
          title="Workspace posture"
          description="Shared theme tokens, Cognito sessions, and future admin shell reuse all start from the same UI primitives."
        >
          <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-2 h-8 rounded-sm bg-background" />
              Background
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-2 h-8 rounded-sm bg-foreground" />
              Foreground
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-2 h-8 rounded-sm bg-primary" />
              Primary
            </div>
          </div>
        </StatePanel>
        <StatePanel
          className="xl:col-span-3"
          title="Security controls"
          description="Cognito handles the sensitive parts of the auth lifecycle while the app owns the branded orchestration."
          actions={
            <Button variant="secondary" size="sm">
              Review
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="font-medium">Protected app routes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Authenticated pages redirect cleanly when session state is
                missing.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="font-medium">Recovery flows</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Verification and reset flows are server-mediated and
                toast-enabled.
              </p>
            </div>
          </div>
        </StatePanel>
        <StatePanel
          className="xl:col-span-5"
          title="Environment controls"
          description="Local and deployed environments can share the same route structure while swapping config through env vars."
          actions={<Button variant="outline">Manage config</Button>}
        >
          <div className="space-y-2">
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm">
              NEXTAUTH_URL
            </div>
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm">
              AUTH_COGNITO_DOMAIN
            </div>
            <div className="rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm">
              APP_API_BASE_URL
            </div>
          </div>
        </StatePanel>
        <StatePanel
          className="xl:col-span-7"
          title="Traffic channels"
          description="A shared dashboard surface ready for product and ops views."
        >
          <TrafficChannelsChart />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-border bg-muted/20 py-2">
              <p className="text-xs text-muted-foreground">Desktop</p>
              <p className="text-xl font-semibold">1,224</p>
            </div>
            <div className="rounded-md border border-border bg-muted/20 py-2">
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-xl font-semibold">860</p>
            </div>
            <div className="rounded-md border border-border bg-muted/20 py-2">
              <p className="text-xs text-muted-foreground">Mix delta</p>
              <p className="text-xl font-semibold text-primary">+42%</p>
            </div>
          </div>
        </StatePanel>
        <StatePanel
          className="xl:col-span-5"
          title="Browser share"
          description="An example card using the shared chart primitives from `packages/ui`."
        >
          <BrowserShareChart />
        </StatePanel>
        <StatePanel className="xl:col-span-4" title="Consistent design">
          <Sparkles className="mb-3 size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Auth pages and the app shell share the same primitives, tokens, and
            motion.
          </p>
        </StatePanel>
        <StatePanel className="xl:col-span-4" title="Monorepo ready">
          <Globe className="mb-3 size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            `packages/ui` and `packages/contracts` define the pieces future
            surfaces can reuse.
          </p>
        </StatePanel>
        <StatePanel className="xl:col-span-4" title="Production friendly">
          <ShieldCheck className="mb-3 size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            The session, backend contract, and logout behavior are aligned with
            Cognito without exposing bearer tokens to browser code.
          </p>
        </StatePanel>
        <div className="xl:col-span-12">
          <BackendIdentityCard />
        </div>
        <StatePanel className="xl:col-span-12" title="Theme and shell status">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <TerminalSquare className="size-4 text-primary" />
              <CircleDot className="size-3 text-primary" />
              <p className="text-sm text-muted-foreground">
                Shared public and app shells are now active
              </p>
            </div>
            <Button variant="outline" size="sm">
              View component system
            </Button>
          </div>
        </StatePanel>
        <ApiEndpointTester
          apiBaseUrl={env.apiBaseUrl ?? null}
          groups={session.user.groups}
        />
      </div>
    </div>
  );
}
