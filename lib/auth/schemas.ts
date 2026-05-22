import { z } from "zod";

/**
 * Auth validation schemas. Used by both client (react-hook-form) and
 * server actions (defense in depth — never trust the client).
 *
 * Password policy per Franchise.md / CLAUDE.md:
 *   - 12+ chars
 *   - mixed case (uppercase + lowercase)
 *   - at least one number
 *   - at least one symbol
 *
 * MFA enforcement for privileged roles arrives in Phase 4 (see PLAN.md).
 */
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .refine((v) => /[a-z]/.test(v), "Must contain a lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Must contain a number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Must contain a symbol");

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
