import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saas-template/ui";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAppSession } from "@/lib/auth/session";

const featureCards = [
  {
    description:
      "Secure Cognito + NextAuth flows for sign-in, verification, recovery, and logout.",
    icon: ShieldCheck,
    title: "Secure access lifecycle",
  },
  {
    description:
      "Reusable public and app shell primitives designed for the main app now and admin surfaces later.",
    icon: Workflow,
    title: "Composable shell system",
  },
  {
    description:
      "Modern operator-facing UI with polished error states, toasts, and theme-aware components.",
    icon: Sparkles,
    title: "SaaS-grade experience",
  },
];

export default async function Home() {
  const session = await getAppSession();

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_26%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_88%,black_12%))] text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <ThemeToggle />
        </div>
        <section className="grid gap-8 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Product template
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-balance md:text-6xl">
                Ship Scalable SAAS Products Effectively.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Ship With Confidence, Scale With Ease.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href={session ? "/dashboard" : "/login"}>
                  {session ? "Go to dashboard" : "Sign in"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={session ? "/logout" : "/signup"}>
                  {session ? "Sign out" : "Create account"}
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {featureCards.map((item) => (
                <Card key={item.title} className="border-border/60 bg-card/80">
                  <CardHeader className="pb-3">
                    <item.icon className="size-5 text-primary" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="border-border/60 bg-card/75">
            <CardHeader>
              <CardTitle>
                {session ? "Authenticated session" : "What ships now"}
              </CardTitle>
              <CardDescription>
                {session
                  ? "Your account is active, and the dashboard is available behind the protected app shell."
                  : "Everything needed for sign-up, verification, recovery, sign-in, and logout now lives in the app."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="rounded-xl border border-border/70 bg-muted/35 p-4">
                <p className="font-medium">Auth pages</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  `/login`, `/signup`, `/verify-email`, `/forgot-password`,
                  `/reset-password`, and `/logout`
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/35 p-4">
                <p className="font-medium">Shared foundations</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  `packages/ui` for shell primitives and `packages/contracts`
                  for backend response contracts.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/35 p-4">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  Ready for future admin surfaces
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Public and protected app shells are now separated cleanly.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
