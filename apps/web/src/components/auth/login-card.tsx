"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from "@saas-template/ui";

import { getAuthRedirectTarget } from "@/lib/auth/redirect";
import { getFriendlyAuthError } from "@/lib/auth/errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

import { Field } from "./field";
import { SocialAuthButtons } from "./social-auth-buttons";

type LoginCardProps = {
  authConfigured: boolean;
  socialProviders: {
    apple: boolean;
    google: boolean;
  };
};

export function LoginCard({ authConfigured, socialProviders }: LoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getAuthRedirectTarget(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");

  const form = useForm<LoginInput>({
    defaultValues: {
      email: searchParams.get("email") ?? "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const errorMessage = useMemo(() => {
    return getFriendlyAuthError(error);
  }, [error]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!authConfigured) {
      return;
    }

    const result = await signIn("credentials", {
      callbackUrl,
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      router.replace(
        `/login?error=${encodeURIComponent(result.error)}&email=${encodeURIComponent(data.email)}${
          callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
        }`,
      );
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  });

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" />
          Product template
        </div>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          A centered sign-in card you can reuse across apps, dashboards, and
          starter projects.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          {!authConfigured ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Auth config needed</AlertTitle>
              <AlertDescription>
                Add your real Cognito hosted UI domain to `apps/web/.env.local`
                before using sign in.
              </AlertDescription>
            </Alert>
          ) : null}
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Sign-in issue</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Field
            htmlFor="email"
            label="Email"
            error={form.formState.errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              disabled={form.formState.isSubmitting}
              {...form.register("email")}
            />
          </Field>
          <Field
            htmlFor="password"
            label="Password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={form.formState.isSubmitting}
              {...form.register("password")}
            />
          </Field>

          <SocialAuthButtons
            callbackUrl={callbackUrl}
            mode="login"
            providers={socialProviders}
          />

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Separator className="flex-1" />
            <span>Password sign in</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full justify-center gap-2"
            disabled={form.formState.isSubmitting || !authConfigured}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Need an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </span>
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            asChild
            variant="ghost"
            className="justify-start px-0 text-muted-foreground"
          >
            <Link href="/">Back to landing page</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
