import { z } from "zod";

const renewalStatusEnum = z.enum([
  "current",
  "expiring_soon",
  "expired",
  "in_renewal",
  "terminated",
]);

export const franchiseeCreateSchema = z.object({
  franchisor_id: z.string().uuid("Select a franchisor"),
  legal_name: z.string().min(2, "Legal name is required").max(160),
  business_entity_name: z.string().max(160).optional().or(z.literal("")),
  contact_number: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  territory: z.string().max(120).optional().or(z.literal("")),
  contract_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  contract_end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  renewal_status: renewalStatusEnum.default("current"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const franchiseeUpdateSchema = franchiseeCreateSchema.extend({
  id: z.string().uuid(),
});

export type FranchiseeCreateInput = z.infer<typeof franchiseeCreateSchema>;
export type FranchiseeUpdateInput = z.infer<typeof franchiseeUpdateSchema>;
export type RenewalStatus = z.infer<typeof renewalStatusEnum>;
