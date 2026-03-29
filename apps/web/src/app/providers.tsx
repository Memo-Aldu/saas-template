"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";

type QueuedToast = {
  description?: string;
  title: string;
  variant?: "error" | "success" | "info";
};

type ProvidersProps = {
  children: React.ReactNode;
};

const TOAST_STORAGE_KEY = "saas-template:toast";

function AuthToastBridge() {
  useEffect(() => {
    const raw = globalThis.localStorage.getItem(TOAST_STORAGE_KEY);
    if (!raw) {
      return;
    }

    globalThis.localStorage.removeItem(TOAST_STORAGE_KEY);

    try {
      const payload = JSON.parse(raw) as QueuedToast;
      const variant = payload.variant ?? "info";
      let showToast;
      if (variant === "success") {
        showToast = toast.success;
      } else if (variant === "error") {
        showToast = toast.error;
      } else {
        showToast = toast;
      }

      showToast(payload.title, {
        description: payload.description,
      });
    } catch {
      toast("Welcome back");
    }
  }, []);

  return null;
}

function SessionExpiryBridge() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status !== "authenticated" ||
      session?.error !== "RefreshAccessTokenError" ||
      pathname === "/logout"
    ) {
      return;
    }

    void signOut({
      callbackUrl: "/login?error=RefreshAccessTokenError",
    });
  }, [pathname, session?.error, status]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        themes={["light", "dark"]}
        storageKey="saas-template-theme"
        enableSystem={false}
        enableColorScheme
        disableTransitionOnChange
      >
        <AuthToastBridge />
        <SessionExpiryBridge />
        {children}
        <Toaster
          position="top-right"
          closeButton
          richColors
          theme="system"
          toastOptions={{
            className: "border-border/60 backdrop-blur",
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
