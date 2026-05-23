"use server";

import { revalidatePath } from "next/cache";
import { eventSchema, EventStatus } from "../domain/event.schema";
import { createEvent, checkAssetAvailability, updateEventStatus, getEventOrganizationId } from "../infrastructure/event.repository";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";
import { assetBelongsToOrganization } from "@/modules/assets/infrastructure/asset.repository";

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
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

    // Permisos
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    if (parsed.data.asset_id) {
      const assetIsValid = await assetBelongsToOrganization(parsed.data.asset_id, orgId);
      if (!assetIsValid) return { error: "El activo seleccionado no pertenece a esta organización" };
    }

    // Validar cruce de horarios (Solo si afecta a un Activo)
    if (parsed.data.asset_id) {
      const isAvailable = await checkAssetAvailability(parsed.data.asset_id, parsed.data.start_time, parsed.data.end_time);
      if (!isAvailable) {
        return { error: "El activo seleccionado ya tiene un evento en este rango de horario." };
      }
    }

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
    const orgId = await getEventOrganizationId(eventId);
    await requireOrgRole(orgId, ["owner", "admin", "member"]);
    await updateEventStatus(eventId, status);
    revalidatePath("/scheduling");
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}
