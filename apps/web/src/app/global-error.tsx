"use client";

import Link from "next/link";
import { AlertOctagon, Home, RefreshCw } from "lucide-react";
import { Button } from "@saas-template/ui";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_28%),linear-gradient(180deg,#10161c,#111927)] text-foreground">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-10 text-center">
          <div className="rounded-full border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertOctagon className="size-8" />
          </div>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight">
            A critical error interrupted the app shell.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            The safest next step is to retry the render or return to the landing
            page and re-enter the experience cleanly.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset}>
              <RefreshCw className="size-4" />
              Retry app
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="size-4" />
                Return home
              </Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
