"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saas-template/ui";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Something went wrong", {
      description: error.message,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_28%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_88%,black_12%))] px-5 py-10">
      <Card className="w-full max-w-2xl border-border/60 bg-card/85">
        <CardHeader className="space-y-4">
          <BrandMark />
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3.5" />
            Recoverable error
          </div>
          <CardTitle>The app hit an unexpected state.</CardTitle>
          <CardDescription>
            We kept the interface stable, but this view couldn&apos;t finish
            rendering. You can retry safely or return home.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pb-6 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
