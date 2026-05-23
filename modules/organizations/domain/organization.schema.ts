import { z } from "zod";

export const OrganizationTypeEnum = z.enum(["residential", "construction", "real_estate", "other"]);
export const OrganizationStatusEnum = z.enum(["active", "inactive"]);

export const organizationSchema = z.object({
  name:             z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type:             OrganizationTypeEnum.default("residential"),
  other_type_label: z.string().optional().nullable(),
  address:          z.string().optional().nullable(),
  city:             z.string().optional().nullable(),
  phone:            z.string().optional().nullable(),
  email:            z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  status:           OrganizationStatusEnum.default("active"),
});

export type OrganizationType   = z.infer<typeof OrganizationTypeEnum>;
export type OrganizationStatus = z.infer<typeof OrganizationStatusEnum>;
export type OrganizationInsert = z.input<typeof organizationSchema>;

export interface Organization {
  id:               string;
  name:             string;
  type:             OrganizationType;
  other_type_label: string | null;
  address:          string | null;
  city:             string | null;
  phone:            string | null;
  email:            string | null;
  status:           OrganizationStatus;
  created_at:       string;
  updated_at:       string;
}
