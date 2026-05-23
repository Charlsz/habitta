export type RelationType = "owner" | "tenant" | "responsible" | "resident";

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  owner:       "Propietario",
  tenant:      "Arrendatario",
  responsible: "Responsable",
  resident:    "Residente",
};

export const RELATION_TYPE_COLORS: Record<RelationType, string> = {
  owner:       "bg-[#d4a373]/15 text-[#c8935f]",
  tenant:      "bg-blue-100   text-blue-700",
  responsible: "bg-purple-100 text-purple-700",
  resident:    "bg-green-100  text-green-700",
};

export const RELATION_TYPE_ICONS: Record<RelationType, string> = {
  owner:       "🏠",
  tenant:      "🔑",
  responsible: "🛡️",
  resident:    "👤",
};

export interface UserAssetRelation {
  id:              string;
  organization_id: string;
  asset_id:        string;
  user_id:         string;
  relation_type:   RelationType;
  is_primary:      boolean;
  created_at:      string;
  /** JOIN profiles */
  profiles?:       { full_name: string; email?: string } | null;
}
