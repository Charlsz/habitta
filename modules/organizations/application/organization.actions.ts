"use server";

import { revalidatePath } from "next/cache";
import { createOrganization } from "../infrastructure/organization.repository";
import { organizationSchema, type OrganizationInsert } from "../domain/organization.schema";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { createNotification } from "@/modules/notifications/infrastructure/notification.repository";
import { seedDefaultCategories } from "@/modules/ticket-categories/infrastructure/category.repository";

export async function createOrganizationAction(data: OrganizationInsert) {
  try {
    const user = await requireAuth();

    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos de la organización inválidos" };

    const org = await createOrganization(parsed.data, user.id);

    // Sembrar categorías por defecto (fire-and-forget)
    seedDefaultCategories(org.id).catch(() => {});

    // Notificar al creador (fire-and-forget)
    createNotification(
      org.id,
      user.id,
      "\ud83c\udfe2 Organización creada",
      `"${org.name}" ha sido creada exitosamente.`,
      "success"
    ).catch(() => {});

    revalidatePath("/organizations");
    return { success: true, organizationId: org.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear la organización";
    return { error: message };
  }
}
