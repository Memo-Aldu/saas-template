"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Lock,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saas-template/ui";

type EndpointDefinition = {
  authorization: "NONE" | "COGNITO" | "AWS_IAM";
  description: string;
  backendPath?: string;
  id: string;
  method: "GET";
  path: string;
  userExpectation: string;
};

type EndpointResult = {
  body: string;
  ok: boolean;
  status: number;
  statusText: string;
};

const endpointDefinitions: EndpointDefinition[] = [
  {
    authorization: "NONE",
    description:
      "Public health check. Anyone in the browser should be able to call this.",
    id: "health",
    method: "GET",
    path: "/skeleton/health",
    userExpectation:
      "Regular users and admins should both get 200 from the browser.",
  },
  {
    authorization: "COGNITO",
    backendPath: "/api/bff/me",
    description: "Authenticated caller identity from the Cognito authorizer.",
    id: "me",
    method: "GET",
    path: "/skeleton/me",
    userExpectation:
      "Signed-in users should get 200 through the server-side backend proxy.",
  },
  {
    authorization: "COGNITO",
    backendPath: "/api/bff/admin",
    description:
      "Admin-only route. Gateway accepts Cognito, Lambda then checks the admin group.",
    id: "admin",
    method: "GET",
    path: "/skeleton/admin",
    userExpectation: "Admins should get 200. Regular users should get 403.",
  },
  {
    authorization: "AWS_IAM",
    backendPath: "/api/bff/private",
    description:
      "IAM-signed service-to-service route. The backend proxy shows the expected failure state.",
    id: "private",
    method: "GET",
    path: "/skeleton/private",
    userExpectation:
      "This should stay blocked unless the request is signed with AWS IAM.",
  },
];

function prettifyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ApiEndpointTester({
  apiBaseUrl,
  groups,
}: {
  apiBaseUrl: string | null;
  groups: string[];
}) {
  const [selectedEndpointId, setSelectedEndpointId] = useState(
    endpointDefinitions[0]?.id ?? "",
  );
  const [result, setResult] = useState<EndpointResult | null>(null);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedEndpoint =
    endpointDefinitions.find(
      (endpoint) => endpoint.id === selectedEndpointId,
    ) ?? endpointDefinitions[0];
  const isAdmin = groups.includes("admin");
  const normalizedBaseUrl = useMemo(
    () => apiBaseUrl?.trim().replace(/\/+$/, "") ?? "",
    [apiBaseUrl],
  );

  function runRequest(endpoint: EndpointDefinition) {
    if (!normalizedBaseUrl) {
      setError(
        "Set APP_API_BASE_URL first so the app knows where to send backend requests.",
      );
      setResult(null);
      setRequestUrl(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      setResult(null);

      const url =
        endpoint.authorization === "NONE"
          ? `${normalizedBaseUrl}${endpoint.path}`
          : `${endpoint.backendPath}`;
      setRequestUrl(url);

      try {
        const response = await fetch(url, {
          method: endpoint.method,
        });

        const text = await response.text();
        let json: { code?: string } | null = null;

        if (text) {
          try {
            json = JSON.parse(text) as { code?: string } | null;
          } catch {}
        }

        if (!response.ok && json?.code === "session_expired") {
          await signOut({
            callbackUrl: "/login?error=RefreshAccessTokenError",
          });
          return;
        }

        let body = text;

        if (json) {
          body = prettifyJson(json);
        }

        setResult({
          body: body || "(empty response body)",
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "The browser request failed before the API returned a response.",
        );
      }
    });
  }

  return (
    <Card className="xl:col-span-12">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Backend route explorer</CardTitle>
            <CardDescription>
              Inspect the shipped route contract from the dashboard. Public
              routes are hit directly from the browser, while protected examples
              go through server-side backend routes so bearer tokens never enter
              browser code.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
              Signed in groups: {groups.length > 0 ? groups.join(", ") : "none"}
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
              Route scope: public + proxied protected routes
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pb-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Configured API base URL</p>
              <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
                {normalizedBaseUrl || "APP_API_BASE_URL is not configured"}
              </div>
              <p className="text-xs text-muted-foreground">
                Public routes use this URL directly. Protected routes use the
                same target through server-side backend routes.
              </p>
            </div>

            <div className="space-y-3">
              {endpointDefinitions.map((endpoint) => {
                const isSelected = endpoint.id === selectedEndpoint.id;

                return (
                  <button
                    key={endpoint.id}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary/60 bg-primary/8"
                        : "border-border bg-background/80 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedEndpointId(endpoint.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs">
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-sm">{endpoint.path}</span>
                      <span className="rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {endpoint.authorization === "NONE"
                          ? "Public"
                          : endpoint.authorization === "COGNITO"
                            ? "Cognito"
                            : "Private IAM"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {endpoint.userExpectation}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={isPending}
                onClick={() => runRequest(selectedEndpoint)}
              >
                {isPending
                  ? "Calling endpoint..."
                  : `Test ${selectedEndpoint.path}`}
              </Button>
              <Button
                disabled={isPending}
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setRequestUrl(null);
                }}
                variant="outline"
              >
                Clear result
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-background/85 p-4">
              <div className="flex items-center gap-2">
                {selectedEndpoint.authorization === "NONE" ? (
                  <Globe className="size-4 text-primary" />
                ) : selectedEndpoint.authorization === "AWS_IAM" ? (
                  <Lock className="size-4 text-amber-600" />
                ) : selectedEndpoint.id === "admin" && isAdmin ? (
                  <ShieldAlert className="size-4 text-primary" />
                ) : (
                  <UserRound className="size-4 text-primary" />
                )}
                <p className="text-sm font-medium">Expected behavior</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedEndpoint.authorization === "NONE"
                  ? "Expected: browser access should succeed because this route is intentionally public."
                  : selectedEndpoint.authorization === "AWS_IAM"
                    ? "Expected: the backend proxy should show a blocked response because this route requires AWS SigV4 IAM."
                    : selectedEndpoint.id === "admin"
                      ? isAdmin
                        ? "Expected: your session includes admin, so the proxied request should succeed."
                        : "Expected: the proxied request should fail unless your Cognito user is in the admin group."
                      : "Expected: the proxied request should succeed for any authenticated session."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedEndpoint.userExpectation}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/85 p-4">
              <p className="text-sm font-medium">Request preview</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  URL:{" "}
                  <span className="font-mono text-foreground">
                    {requestUrl ??
                      (normalizedBaseUrl
                        ? selectedEndpoint.authorization === "NONE"
                          ? `${normalizedBaseUrl}${selectedEndpoint.path}`
                          : `${selectedEndpoint.backendPath}`
                        : "(missing base URL)")}
                  </span>
                </p>
                <p>
                  Auth path:{" "}
                  <span className="font-mono text-foreground">
                    {selectedEndpoint.authorization === "NONE"
                      ? "none"
                      : "server-side backend proxy"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-slate-950 p-4 text-slate-50">
              <div className="flex items-center gap-2">
                {error ? (
                  <AlertCircle className="size-4 text-rose-300" />
                ) : result?.ok ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : (
                  <AlertCircle className="size-4 text-amber-300" />
                )}
                <p className="text-sm font-medium">Response</p>
              </div>
              {requestUrl ? (
                <p className="mt-3 break-all font-mono text-xs text-slate-300">
                  {requestUrl}
                </p>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-rose-200">{error}</p>
              ) : null}
              {result ? (
                <>
                  <p className="mt-3 text-sm text-slate-200">
                    Status: {result.status} {result.statusText}
                  </p>
                  <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-black/30 p-3 text-xs leading-6 text-slate-100">
                    {result.body}
                  </pre>
                </>
              ) : !error ? (
                <p className="mt-3 text-sm text-slate-300">
                  Run a request to inspect the live response body here.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
