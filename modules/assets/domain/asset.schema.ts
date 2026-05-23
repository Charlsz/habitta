import { z } from "zod";

export const AssetStatusEnum = z.enum(["active", "maintenance", "inactive"]);

export const AssetTypeEnum = z.enum([
  "apartment",
  "house",
  "parking",
  "common_area",
  "office",
  "warehouse",
  "land",
  "other",
]);

export const ASSET_TYPE_LABELS: Record<z.infer<typeof AssetTypeEnum>, string> = {
  apartment:   "Apartamento",
  house:       "Casa",
  parking:     "Parqueadero",
  common_area: "Zona com\u00fan",
  office:      "Oficina",
  warehouse:   "Bodega",
  land:        "Lote",
  other:       "Otro",
};

export const ASSET_TYPE_COLORS: Record<z.infer<typeof AssetTypeEnum>, string> = {
  apartment:   "bg-blue-100 text-blue-700",
  house:       "bg-green-100 text-green-700",
  parking:     "bg-yellow-100 text-yellow-700",
  common_area: "bg-purple-100 text-purple-700",
  office:      "bg-indigo-100 text-indigo-700",
  warehouse:   "bg-orange-100 text-orange-700",
  land:        "bg-lime-100 text-lime-700",
  other:       "bg-gray-100 text-gray-600",
};

export const assetSchema = z.object({
  organization_id: z.string().uuid(),
  name:            z.string().min(2, "El nombre del activo es requerido"),
  asset_type:      AssetTypeEnum.default("other"),
  code:            z.string().optional().nullable(),
  description:     z.string().optional().nullable(),
  location:        z.string().optional().nullable(),
  status:          AssetStatusEnum.default("active"),
  metadata:        z.record(z.unknown()).optional().nullable(),
});

export type AssetStatus = z.infer<typeof AssetStatusEnum>;
export type AssetType   = z.infer<typeof AssetTypeEnum>;
export type AssetInsert = z.input<typeof assetSchema>;

export interface Asset {
  id:              string;
  organization_id: string;
  name:            string;
  asset_type:      AssetType;
  code:            string | null;
  description:     string | null;
  location:        string | null;
  status:          AssetStatus;
  metadata:        Record<string, unknown> | null;
  created_at:      string;
  updated_at:      string;
}
