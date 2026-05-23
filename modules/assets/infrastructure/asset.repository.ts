import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { Asset, AssetInsert } from "../domain/asset.schema";

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

export async function createAsset(asset: AssetInsert): Promise<Asset> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assets")
    .insert([{
      organization_id: asset.organization_id,
      name: asset.name,
      description: asset.description,
      location: asset.location,
      status: asset.status,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Asset;
}

export async function assetBelongsToOrganization(assetId: string, organizationId: string): Promise<boolean> {
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
