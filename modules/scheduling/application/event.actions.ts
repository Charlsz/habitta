"use server";

import { revalidatePath } from "next/cache";
import { eventSchema, EventStatus } from "../domain/event.schema";
import { createEvent, checkAssetAvailability, updateEventStatus } from "../infrastructure/event.repository";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";

export async function createEventAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const orgId = formData.get("organization_id") as string;
    
    // Obtener campos base
    const data = {
      organization_id: orgId,
      asset_id: (formData.get("asset_id") as string) || undefined,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
    };

    // Validar integridad temporal y tipos
    const parsed = eventSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message || "Datos inválidos" };

    // Validar cruce de horarios (Solo si afecta a un Activo)
    if (parsed.data.asset_id) {
      const isAvailable = await checkAssetAvailability(parsed.data.asset_id, parsed.data.start_time, parsed.data.end_time);
      if (!isAvailable) {
        return { error: "El activo seleccionado ya tiene un evento en este rango de horario." };
      }
    }

    // Permisos
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    // Guardar
    await createEvent(parsed.data, user.id);

    revalidatePath("/scheduling");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "No se pudo agendar el evento" };
  }
}

export async function changeEventStatusAction(eventId: string, status: EventStatus) {
  try {
    // Si quisieras que los usuarios no puedan aproborse a si mismos, validarías el rol "owner/admin" aquí
    await requireAuth();
    await updateEventStatus(eventId, status);
    revalidatePath("/scheduling");
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}
