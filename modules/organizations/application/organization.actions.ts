"use server";

import { revalidatePath } from "next/cache";
import { organizationSchema, OrganizationInsert } from "../domain/organization.schema";
import { createOrganization } from "../infrastructure/organization.repository";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { createNotification } from "@/modules/notifications/infrastructure/notification.repository";

export async function createOrganizationAction(data: OrganizationInsert) {
  try {
    const user = await requireAuth();

    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos invalidos: " + parsed.error.issues[0]?.message };
    }

    const org = await createOrganization(parsed.data, user.id);

    // Notificar al creador
    createNotification(
      org.id,
      user.id,
      "\u00a1Organizaci\u00f3n creada!",
      `Tu organizaci\u00f3n "${org.name}" fue creada exitosamente.`,
      "success"
    ).catch(() => {});

    revalidatePath("/organizations");
    return { success: true, data: org };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: error.message || "Error al crear la organizacion" };
  }
}
