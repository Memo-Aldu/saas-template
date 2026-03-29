"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@saas-template/ui";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

import { Field } from "./field";

export function ResetPasswordCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<ResetPasswordInput>({
    defaultValues: {
      code: "",
      confirmPassword: "",
      email: searchParams.get("email") ?? "",
      password: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await fetch("/api/cognito/reset-password", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      toast.error("Password reset failed", {
        description: result.message,
      });
      return;
    }

    toast.success("Password updated", {
      description: result.message,
    });
    router.push(`/login?email=${encodeURIComponent(data.email)}`);
  });

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldAlert className="size-3.5" />
          Product template
        </div>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          Enter the reset code and set the new password you want to use.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <Field
            htmlFor="email"
            label="Email"
            error={form.formState.errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={form.formState.isSubmitting}
              {...form.register("email")}
            />
          </Field>
          <Field
            htmlFor="code"
            label="Reset code"
            error={form.formState.errors.code?.message}
          >
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              disabled={form.formState.isSubmitting}
              {...form.register("code")}
            />
          </Field>
          <Field
            htmlFor="password"
            label="New password"
            description="At least 12 characters, including uppercase, lowercase, and a number."
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
            label="Confirm new password"
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
                Saving new password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Need a fresh code?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              Start over
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
