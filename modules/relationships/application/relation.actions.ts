"use server";

import { revalidatePath } from "next/cache";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { upsertRelation, removeRelation } from "../infrastructure/relation.repository";
import { RelationType } from "../domain/relation.schema";

export async function assignRelationAction(formData: FormData) {
  try {
    const orgId        = String(formData.get("organization_id"));
    const assetId      = String(formData.get("asset_id"));
    const userId       = String(formData.get("user_id"));
    const relationType = String(formData.get("relation_type")) as RelationType;
    const isPrimary    = formData.get("is_primary") === "true";

    if (!orgId || !assetId || !userId || !relationType) {
      return { error: "Faltan datos requeridos" };
    }

    await requireOrgRole(orgId, ["owner", "admin"]);
    await upsertRelation(orgId, assetId, userId, relationType, isPrimary);

    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/assets");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function removeRelationAction(formData: FormData) {
  try {
    const orgId   = String(formData.get("organization_id"));
    const assetId = String(formData.get("asset_id"));
    const userId  = String(formData.get("user_id"));

    await requireOrgRole(orgId, ["owner", "admin"]);
    await removeRelation(assetId, userId);

    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/assets");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
