"use server";

import { revalidatePath } from "next/cache";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { upsertCategory, deleteCategory } from "../infrastructure/category.repository";

export async function saveCategoryAction(formData: FormData) {
  try {
    const orgId       = String(formData.get("organization_id"));
    const id          = formData.get("id") ? String(formData.get("id")) : null;
    const name        = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const color       = String(formData.get("color") ?? "#6B7280");

    if (!name) return { error: "El nombre es requerido" };
    await requireOrgRole(orgId, ["owner", "admin"]);
    await upsertCategory({ id, orgId, name, description, color });
    revalidatePath(`/organizations/${orgId}/settings`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCategoryAction(formData: FormData) {
  try {
    const orgId = String(formData.get("organization_id"));
    const id    = String(formData.get("id"));
    await requireOrgRole(orgId, ["owner", "admin"]);
    await deleteCategory(id, orgId);
    revalidatePath(`/organizations/${orgId}/settings`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
