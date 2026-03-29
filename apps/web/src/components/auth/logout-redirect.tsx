"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saas-template/ui";

import { queueToast } from "@/lib/auth/toast";

export function LogoutRedirect({ logoutUrl }: { logoutUrl: string }) {
  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      queueToast({
        description: "You have been signed out.",
        title: "Signed out",
        variant: "success",
      });

      await signOut({ redirect: false });

      if (isMounted) {
        window.location.assign(logoutUrl);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [logoutUrl]);

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader>
        <CardTitle>Signing you out</CardTitle>
        <CardDescription>
          Wrapping up your session and sending you back to the landing page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3 pb-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        One moment while we finish the logout flow.
      </CardContent>
    </Card>
  );
}
