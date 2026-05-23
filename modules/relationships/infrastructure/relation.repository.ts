import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { UserAssetRelation, RelationType } from "../domain/relation.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Relaciones de un activo con sus usuarios (JOIN profiles) */
export async function getRelationsByAsset(assetId: string): Promise<UserAssetRelation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_asset_relations")
    .select("*, profiles (full_name)")
    .eq("asset_id", assetId)
    .order("is_primary", { ascending: false })
    .order("created_at",  { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserAssetRelation[];
}

/**
 * Responsable principal de un activo:
 * is_primary = true, relation_type IN ('owner','responsible'), primera fila.
 */
export async function getPrimaryResponsible(
  assetId: string
): Promise<{ full_name: string; relation_type: RelationType } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_asset_relations")
    .select("relation_type, profiles (full_name)")
    .eq("asset_id", assetId)
    .eq("is_primary", true)
    .in("relation_type", ["owner", "responsible"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  // Supabase infiere profiles como array sin tipos generados; cast via unknown es seguro
  // porque .maybeSingle() + FK directa retorna un objeto en runtime.
  const p = (data.profiles as unknown) as { full_name: string } | null;
  if (!p) return null;
  return { full_name: p.full_name, relation_type: data.relation_type as RelationType };
}

/** Upsert relaci\u00f3n usuario\u2194activo v\u00eda RPC SECURITY DEFINER */
export async function upsertRelation(
  organizationId: string,
  assetId:        string,
  userId:         string,
  relationType:   RelationType,
  isPrimary:      boolean
): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin.rpc("upsert_user_asset_relation", {
    p_organization_id: organizationId,
    p_asset_id:        assetId,
    p_user_id:         userId,
    p_relation_type:   relationType,
    p_is_primary:      isPrimary,
  });
  if (error) throw new Error(error.message);
}

/** Eliminar relaci\u00f3n */
export async function removeRelation(assetId: string, userId: string): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin.rpc("remove_user_asset_relation", {
    p_asset_id: assetId,
    p_user_id:  userId,
  });
  if (error) throw new Error(error.message);
}
