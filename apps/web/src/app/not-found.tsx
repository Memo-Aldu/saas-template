import Link from "next/link";
import { Compass, Home, LifeBuoy } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saas-template/ui";

import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.14),transparent_28%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_88%,black_12%))] px-5 py-10">
      <Card className="w-full max-w-2xl border-border/60 bg-card/85">
        <CardHeader className="space-y-4">
          <BrandMark />
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Compass className="size-3.5" />
            Route not found
          </div>
          <CardTitle>That page doesn&apos;t exist in this workspace.</CardTitle>
          <CardDescription>
            The route may have moved, expired, or never existed. Use one of the
            safe paths below to get back on track.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pb-6 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <LifeBuoy className="size-4" />
              Go to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
