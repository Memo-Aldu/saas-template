import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    confirmPassword: z.string(),
    email: z.string().email("Enter a valid email address."),
    name: z.string().min(2, "Enter your full name."),
    password: passwordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  code: z.string().min(6, "Enter the 6-digit verification code."),
  email: z.string().email("Enter a valid email address."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    code: z.string().min(6, "Enter the 6-digit reset code."),
    confirmPassword: z.string(),
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
