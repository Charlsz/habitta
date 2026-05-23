import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Asset, AssetInsert } from "../domain/asset.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getAssetsByOrganization(organizationId: string): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Asset[];
}

export async function getAssetById(id: string): Promise<Asset> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as Asset;
}

export async function createAsset(asset: AssetInsert, userId: string): Promise<Asset> {
  const admin = getAdmin();
  const { data, error } = await admin.rpc("create_asset_for_user", {
    p_organization_id: asset.organization_id,
    p_name:            asset.name,
    p_asset_type:      asset.asset_type || "other",
    p_description:     asset.description || null,
    p_location:        asset.location    || null,
    p_status:          asset.status      || "active",
    p_code:            asset.code        || null,
    p_metadata:        asset.metadata    || null,
    p_creator_id:      userId,
  });
  if (error) throw new Error(error.message);
  return data as Asset;
}

export async function assetBelongsToOrganization(
  assetId:        string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("id", assetId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
