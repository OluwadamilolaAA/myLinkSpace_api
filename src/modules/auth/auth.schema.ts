import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes"
  );

export const registerSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100),

  email: z.email().trim().toLowerCase().max(255),

  password: passwordSchema,
});

export const loginSchema = z.strictObject({
  email: z.email().trim().toLowerCase(),

  password: z.string().min(1),
});

export const forgotPasswordSchema = z.strictObject({
  email: z.email().trim().toLowerCase().max(255),
});

export const resetPasswordSchema = z.strictObject({
  token: z
    .string()
    .regex(
      /^[a-f0-9]{64}$/,
      "Invalid password reset token"
    ),

  newPassword: passwordSchema,
});