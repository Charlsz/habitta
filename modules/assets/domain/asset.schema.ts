import { z } from "zod";

export const AssetStatusEnum = z.enum(["active", "maintenance", "inactive"]);

export const assetSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(2, "El nombre del activo es requerido"),
  description: z.string().optional(),
  location: z.string().optional(),
  status: AssetStatusEnum.default("active"),
});

export type AssetStatus = z.infer<typeof AssetStatusEnum>;
export type AssetInsert = z.infer<typeof assetSchema>;

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}
