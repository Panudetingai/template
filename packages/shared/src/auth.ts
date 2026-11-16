import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(1, { message: "Please enter your password" })
    .min(8, { message: "Please enter a valid password" })
    .max(20, { message: "Password must be less than 20 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      { message: "Please enter a valid password" },
    ),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignupSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(1, { message: "Please enter your password" })
    .min(8, { message: "Please enter a valid password" })
    .max(20, { message: "Password must be less than 20 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      { message: "Please enter a valid password" },
    ),
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;

export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
});

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

const passwordField = z
  .string()
  .min(1, { message: "Please enter your password" })
  .min(8, { message: "Please enter a valid password" })
  .max(20, { message: "Password must be less than 20 characters" })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    { message: "Please enter a valid password" },
  );

export const NewPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordSchemaType = z.infer<typeof NewPasswordSchema>;
