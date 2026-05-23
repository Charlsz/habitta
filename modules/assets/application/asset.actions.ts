"use server";

import { revalidatePath } from "next/cache";
import { assetSchema, AssetInsert } from "../domain/asset.schema";
import { createAsset } from "../infrastructure/asset.repository";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";

export async function createAssetAction(data: AssetInsert) {
  try {
    // Validamos acceso ("member" al menos, podrías cambiar a solo "admin")
    await requireOrgRole(data.organization_id, ["owner", "admin", "member"]);
    
    const parsed = assetSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos del activo inválidos" };

    const asset = await createAsset(parsed.data);
    
    revalidatePath(`/organizations/${data.organization_id}`);
    revalidatePath("/assets");
    
    return { success: true, data: asset };
  } catch (error: any) {
    return { error: error.message || "Error al crear el activo" };
  }
}
