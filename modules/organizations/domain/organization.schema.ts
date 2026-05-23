import { z } from "zod";

export const OrganizationTypeEnum = z.enum(["residential", "construction", "real_estate", "other"]);

export const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: OrganizationTypeEnum.default("other"),
});

export type OrganizationType = z.infer<typeof OrganizationTypeEnum>;
export type OrganizationInsert = z.input<typeof organizationSchema>;

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  created_at: string;
  updated_at: string;
}
