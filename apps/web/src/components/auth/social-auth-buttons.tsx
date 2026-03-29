"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@saas-template/ui";

import { queueToast } from "@/lib/auth/toast";

type EnabledProviders = {
  apple: boolean;
  google: boolean;
};

type SocialAuthButtonsProps = {
  callbackUrl?: string;
  mode: "login" | "signup";
  providers: EnabledProviders;
};

type ProviderKey = "apple" | "google";

const PROVIDER_CONFIG: Record<
  ProviderKey,
  { cognitoProvider: string; label: string }
> = {
  apple: {
    cognitoProvider: "SignInWithApple",
    label: "Apple",
  },
  google: {
    cognitoProvider: "Google",
    label: "Google",
  },
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.68-.06-1.34-.18-1.97H12v3.73h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.94-1.79 3.04-4.43 3.04-7.4Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.07-.91 6.76-2.47l-3.3-2.56c-.91.61-2.08.97-3.46.97-2.66 0-4.92-1.8-5.73-4.22H2.86v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.27 13.72a5.99 5.99 0 0 1 0-3.44V7.64H2.86a10 10 0 0 0 0 8.72l3.41-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.93-2.93C17.07 3.03 14.76 2 12 2a10 10 0 0 0-9.14 5.64l3.41 2.64C7.08 7.86 9.34 6.06 12 6.06Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M15.22 3.5c.06.86-.22 1.73-.77 2.42-.6.76-1.56 1.35-2.44 1.3-.1-.84.25-1.75.81-2.4.61-.72 1.64-1.26 2.4-1.32Z" />
      <path d="M18.15 12.83c.02 2.58 2.25 3.44 2.27 3.45-.02.06-.36 1.23-1.18 2.44-.71 1.04-1.45 2.07-2.62 2.09-1.15.02-1.52-.68-2.84-.68-1.31 0-1.72.66-2.81.7-1.13.04-1.99-1.12-2.71-2.16-1.46-2.11-2.58-5.95-1.08-8.56.74-1.29 2.07-2.11 3.52-2.13 1.1-.02 2.14.74 2.84.74.69 0 1.98-.91 3.34-.78.57.02 2.16.23 3.18 1.72-.08.05-1.9 1.11-1.91 3.17Z" />
    </svg>
  );
}

export function SocialAuthButtons({
  callbackUrl,
  mode,
  providers,
}: SocialAuthButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<ProviderKey | null>(
    null,
  );

  const enabledProviders = (
    Object.entries(providers) as [ProviderKey, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([provider]) => provider);

  if (enabledProviders.length === 0) {
    return null;
  }

  const handleProviderSignIn = async (provider: ProviderKey) => {
    const config = PROVIDER_CONFIG[provider];
    setActiveProvider(provider);

    queueToast({
      description: `Redirecting to ${config.label} through Cognito.`,
      title: mode === "signup" ? "Creating account" : "Signing in",
      variant: "success",
    });

    await signIn(
      "cognito",
      { callbackUrl: callbackUrl ?? "/dashboard" },
      { identity_provider: config.cognitoProvider },
    );
  };

  return (
    <div className="grid gap-3">
      {enabledProviders.map((provider) => {
        const isPending = activeProvider === provider;
        const config = PROVIDER_CONFIG[provider];
        const Icon = provider === "google" ? GoogleIcon : AppleIcon;

        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            size="lg"
            className="w-full justify-center gap-2"
            disabled={activeProvider !== null}
            onClick={() => void handleProviderSignIn(provider)}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Icon />}
            {mode === "signup" ? "Continue" : "Sign in"} with {config.label}
          </Button>
        );
      })}
    </div>
  );
}
