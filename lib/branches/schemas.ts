import { z } from "zod";

const branchStatusEnum = z.enum(["pending_opening", "active", "inactive", "closed"]);

export const branchCreateSchema = z.object({
  franchisor_id: z.string().uuid("Select a franchisor"),
  name: z.string().min(2, "Branch name is required").max(120),
  code: z
    .string()
    .min(2, "Branch code is required")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, hyphen, underscore only"),
  address: z.string().max(300).optional().or(z.literal("")),
  region: z.string().max(80).optional().or(z.literal("")),
  province: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  opening_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  status: branchStatusEnum.default("pending_opening"),
  contact_person: z.string().max(120).optional().or(z.literal("")),
  contact_phone: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const branchUpdateSchema = branchCreateSchema.extend({
  id: z.string().uuid(),
});

export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;
export type BranchStatus = z.infer<typeof branchStatusEnum>;
