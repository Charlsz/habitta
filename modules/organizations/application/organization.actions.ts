"use server";

import { revalidatePath } from "next/cache";
import { createOrganization } from "../infrastructure/organization.repository";
import { organizationSchema } from "../domain/organization.schema";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import {
  createNotification,
} from "@/modules/notifications/infrastructure/notification.repository";
import { seedDefaultCategories } from "@/modules/ticket-categories/infrastructure/category.repository";

export async function createOrganizationAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const raw  = Object.fromEntries(formData.entries());

    const parsed = organizationSchema.safeParse({
      name:    raw.name,
      address: raw.address || undefined,
      city:    raw.city    || undefined,
      phone:   raw.phone   || undefined,
      email:   raw.email   || undefined,
    });
    if (!parsed.success) return { error: "Datos de la organizaci\u00f3n inv\u00e1lidos" };

    const org = await createOrganization(parsed.data, user.id);

    // Sembrar categorías por defecto (fire-and-forget)
    seedDefaultCategories(org.id).catch(() => {});

    // Notificar al creador (fire-and-forget)
    createNotification(
      org.id,
      user.id,
      "\ud83c\udfe2 Organizaci\u00f3n creada",
      `"${org.name}" ha sido creada exitosamente.`,
      "success"
    ).catch(() => {});

    revalidatePath("/organizations");
    return { success: true, organizationId: org.id };
  } catch (error: any) {
    return { error: error.message || "Error al crear la organizaci\u00f3n" };
  }
}
