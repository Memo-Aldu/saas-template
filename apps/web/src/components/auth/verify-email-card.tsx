"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck, RotateCcw } from "lucide-react";
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
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/lib/validations/auth";

import { Field } from "./field";

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [isResending, setIsResending] = useState(false);
  const form = useForm<VerifyEmailInput>({
    defaultValues: {
      code: "",
      email: initialEmail,
    },
    resolver: zodResolver(verifyEmailSchema),
  });

  const resend = async () => {
    if (isResending || form.formState.isSubmitting) {
      return;
    }

    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { message: "Enter your email address first." });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/cognito/resend-verification", {
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error("Couldn't resend the code", {
          description: result.message,
        });
        return;
      }

      toast.success("Verification code sent", {
        description: result.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await fetch("/api/cognito/verify-email", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      toast.error("Verification failed", {
        description: result.message,
      });
      return;
    }

    toast.success("Email verified", {
      description: result.message,
    });

    router.push(`/login?email=${encodeURIComponent(data.email)}`);
  });

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <MailCheck className="size-3.5" />
          Product template
        </div>
        <CardTitle>Confirm your inbox</CardTitle>
        <CardDescription>
          Enter the code from your email to finish setting up your account.
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
              disabled={form.formState.isSubmitting || isResending}
              {...form.register("email")}
            />
          </Field>
          <Field
            htmlFor="code"
            label="Verification code"
            description="Use the 6-digit code from your email."
            error={form.formState.errors.code?.message}
          >
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              disabled={form.formState.isSubmitting || isResending}
              {...form.register("code")}
            />
          </Field>
        </CardContent>
        <CardFooter className="mt-2 flex-col items-stretch gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting || isResending}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resend}
            disabled={form.formState.isSubmitting || isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                Resend code
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
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
