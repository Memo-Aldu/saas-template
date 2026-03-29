"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { StatePanel } from "@saas-template/ui";

type BackendIdentity = {
  email: string | null;
  groups: string[];
  username: string | null;
};

type BackendIdentityResponse = {
  data: BackendIdentity;
  message: string;
};

type ErrorResponse = {
  code?: string;
  message?: string;
};

export function BackendIdentityCard() {
  const [state, setState] = useState({
    code: null as string | null,
    error: null as string | null,
    identity: null as BackendIdentity | null,
    isLoading: true,
    message: null as string | null,
  });

  useEffect(() => {
    let active = true;

    async function loadIdentity() {
      try {
        const response = await fetch("/api/bff/me", {
          cache: "no-store",
        });
        const payload = (await response.json()) as
          | BackendIdentityResponse
          | ErrorResponse;

        if (!active) {
          return;
        }

        if (
          !response.ok &&
          "code" in payload &&
          payload.code === "session_expired"
        ) {
          await signOut({
            callbackUrl: "/login?error=RefreshAccessTokenError",
          });
          return;
        }

        if (!response.ok) {
          const errorCode = "code" in payload ? (payload.code ?? null) : null;
          setState({
            code: errorCode,
            error: payload.message ?? "Unable to load backend identity.",
            identity: null,
            isLoading: false,
            message: null,
          });
          return;
        }

        setState({
          code: null,
          error: null,
          identity: "data" in payload ? payload.data : null,
          isLoading: false,
          message: "message" in payload ? (payload.message ?? null) : null,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          code: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load backend identity.",
          identity: null,
          isLoading: false,
          message: null,
        });
      }
    }

    void loadIdentity();

    return () => {
      active = false;
    };
  }, []);

  return (
    <StatePanel
      title="Backend contract"
      description="This panel loads `/skeleton/me` through a server-side route so the typed backend contract stays in sync without exposing bearer tokens to browser code."
    >
      {state.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Loading backend identity...
        </div>
      ) : state.error ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span>{state.error}</span>
          </div>
          {state.code === "service_unavailable" ? (
            <p>
              Configure `APP_API_BASE_URL` to enable the backend identity panel.
              The dashboard still works with session-only identity while that
              backend is unavailable.
            </p>
          ) : (
            <p>
              Your session is still valid locally. This failure means the
              server-side backend call could not complete or the upstream
              response did not match the expected contract.
            </p>
          )}
        </div>
      ) : state.identity ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-4" />
            <span>
              {state.message ?? "Authenticated backend identity loaded."}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 font-medium text-foreground">
                {state.identity.email ?? "Unknown email"}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="mt-1 font-medium text-foreground">
                {state.identity.username ?? "Not available"}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Groups</p>
              <p className="mt-1 font-medium text-foreground">
                {state.identity.groups.length > 0
                  ? state.identity.groups.join(", ")
                  : "No groups assigned"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </StatePanel>
  );
}
