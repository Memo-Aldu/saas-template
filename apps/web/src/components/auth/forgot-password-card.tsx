"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
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
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

import { Field } from "./field";

export function ForgotPasswordCard() {
  const router = useRouter();
  const form = useForm<ForgotPasswordInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await fetch("/api/cognito/forgot-password", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      toast.error("Couldn't start password reset", {
        description: result.message,
      });
      return;
    }

    toast.success("Reset email sent", {
      description: result.message,
    });
    router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
  });

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="space-y-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <KeyRound className="size-3.5" />
          Product template
        </div>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a code to choose a new
          password.
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
              placeholder="name@company.com"
              disabled={form.formState.isSubmitting}
              {...form.register("email")}
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
                Sending reset email...
              </>
            ) : (
              "Send reset code"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
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
