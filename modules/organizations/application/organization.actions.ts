"use server";

import { revalidatePath } from "next/cache";
import { organizationSchema, OrganizationInsert } from "../domain/organization.schema";
import { createOrganization } from "../infrastructure/organization.repository";
import { requireAuth } from "@/modules/auth/application/auth.guard";

export async function createOrganizationAction(data: OrganizationInsert) {
  try {
    const user = await requireAuth();
    
    // Validación server-side
    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos" };
    }

    const org = await createOrganization(parsed.data, user.id);
    
    revalidatePath("/organizations");
    return { success: true, data: org };
  } catch (error: any) {
    return { error: error.message || "Error al crear la organización" };
  }
}
