"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import {
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
import { toast } from "sonner";

import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

import { Field } from "./field";
import { SocialAuthButtons } from "./social-auth-buttons";

type SignUpCardProps = {
  socialProviders: {
    apple: boolean;
    google: boolean;
  };
};

export function SignUpCard({ socialProviders }: SignUpCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const form = useForm<SignUpInput>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await fetch("/api/cognito/signup", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      toast.error("Could not create your account", {
        description: result.message,
      });
      return;
    }

    toast.success("Account created", {
      description: result.message,
    });
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  });

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <UserPlus className="size-3.5" />
          Product template
        </div>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          A reusable sign-up flow for starter apps, dashboards, and SaaS
          products.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <SocialAuthButtons
            callbackUrl={callbackUrl}
            mode="signup"
            providers={socialProviders}
          />
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <Separator className="flex-1" />
            <span>Or create with email</span>
            <Separator className="flex-1" />
          </div>
          <Field
            htmlFor="name"
            label="Full name"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="name"
              autoComplete="name"
              placeholder="Jane Doe"
              disabled={form.formState.isSubmitting}
              {...form.register("name")}
            />
          </Field>
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
            description="Use at least 12 characters with uppercase, lowercase, and numbers."
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={form.formState.isSubmitting}
              {...form.register("password")}
            />
          </Field>
          <Field
            htmlFor="confirmPassword"
            label="Confirm password"
            error={form.formState.errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={form.formState.isSubmitting}
              {...form.register("confirmPassword")}
            />
          </Field>
        </CardContent>
        <CardFooter className="mt-2 flex-col items-stretch gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have access?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
