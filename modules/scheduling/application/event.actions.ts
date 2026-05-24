"use server";

import { revalidatePath } from "next/cache";
import { eventSchema, EventStatus } from "../domain/event.schema";
import { createEvent, checkAssetAvailability, updateEventStatus, getEventOrganizationId } from "../infrastructure/event.repository";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";
import { assetBelongsToOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { notifyScheduledVisit } from "./telegram-notify.actions";
import { createClient } from "@/lib/supabase/server";

export async function createEventAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const orgId = formData.get("organization_id") as string;

    const data = {
      organization_id: orgId,
      asset_id: (formData.get("asset_id") as string) || undefined,
      ticket_id: (formData.get("ticket_id") as string) || undefined,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
    };

    const parsed = eventSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    if (parsed.data.asset_id) {
      const assetIsValid = await assetBelongsToOrganization(parsed.data.asset_id, orgId);
      if (!assetIsValid) return { error: "El activo seleccionado no pertenece a esta organización" };
    }

    if (parsed.data.asset_id) {
      const isAvailable = await checkAssetAvailability(parsed.data.asset_id, parsed.data.start_time, parsed.data.end_time);
      if (!isAvailable) {
        return { error: "El activo seleccionado ya tiene un evento en este rango de horario." };
      }
    }

    await createEvent(parsed.data, user.id);

    // — Notificación Telegram si el evento está ligado a un ticket —
    if (parsed.data.ticket_id) {
      const supabase = await createClient();
      const { data: ticket } = await supabase
        .from("tickets")
        .select("title, telegram_session_id")
        .eq("id", parsed.data.ticket_id)
        .single();

      if (ticket?.telegram_session_id) {
        const technicianName =
          (user.user_metadata?.full_name as string | undefined) ||
          user.email ||
          "Técnico asignado";

        await notifyScheduledVisit({
          ticketId: parsed.data.ticket_id,
          ticketTitle: ticket.title,
          startTime: parsed.data.start_time,
          technicianName,
        }).catch((e) => console.error("[createEventAction] notify error:", e));
      }
    }

    revalidatePath("/scheduling");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "No se pudo agendar el evento" };
  }
}

export async function changeEventStatusAction(eventId: string, status: EventStatus) {
  try {
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
