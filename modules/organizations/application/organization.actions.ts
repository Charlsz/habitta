"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { organizationSchema, OrganizationInsert } from "../domain/organization.schema";
import { createOrganization } from "../infrastructure/organization.repository";
import { requireAuth } from "@/modules/auth/application/auth.guard";

export async function createOrganizationAction(data: OrganizationInsert) {
  try {
    // 1. Validar sesion - requireAuth() usa getUser() que siempre verifica el JWT
    const user = await requireAuth();

    // 2. Validar datos del formulario
    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos invalidos: " + parsed.error.issues[0]?.message };
    }

    // 3. Crear org via RPC SECURITY DEFINER (no depende de auth.uid() en Supabase)
    const org = await createOrganization(parsed.data, user.id);

    revalidatePath("/organizations");
    return { success: true, data: org };
  } catch (error: any) {
    // Si requireAuth() redirige, next/navigation lanza un error especial - dejarlo pasar
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: error.message || "Error al crear la organizacion" };
  }
}
