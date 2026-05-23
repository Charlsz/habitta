"use server";

import { revalidatePath } from "next/cache";
import { ticketSchema, TicketStatus } from "../domain/ticket.schema";
import { createTicket, uploadTicketAttachment, updateTicketStatus, addTicketComment } from "../infrastructure/ticket.repository";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";
import { redirect } from "next/navigation";

export async function createTicketAction(formData: FormData) {
  try {
    const user = await requireAuth();
    
    // Simplificación de extracción de FormData
    const rawData = Object.fromEntries(formData.entries());
    const orgId = String(rawData.organization_id);

    const data = {
      organization_id: orgId,
      asset_id: rawData.asset_id ? String(rawData.asset_id) : undefined,
      title: String(rawData.title),
      description: String(rawData.description),
      priority: String(rawData.priority),
    };

    // Validar Zod
    const parsed = ticketSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos del ticket inválidos" };

    // Validar permisos en la org
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    // Crear DB
    const newTicket = await createTicket(parsed.data, user.id);

    // Adjunto si existe
    const file = formData.get("attachment") as File;
    if (file && file.size > 0) {
      await uploadTicketAttachment(file, orgId, newTicket.id, user.id);
    }

    revalidatePath("/tickets");
    return { success: true, ticketId: newTicket.id };
  } catch (error: any) {
    return { error: error.message || "Ocurrió un error al crear el ticket" };
  }
}

export async function changeTicketStatusAction(ticketId: string, status: TicketStatus) {
  // Aquí podríamos validar roles de "admin" para cerrar tickets. Lo mantendré general.
  try {
    await requireAuth();
    await updateTicketStatus(ticketId, status);
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function addTicketCommentAction(formData: FormData) {
  try {
    const user = await requireAuth();
    const ticketId = formData.get("ticket_id") as string;
    const message = formData.get("message") as string;

    if (!message || message.trim().length === 0) return { error: "Mensaje vacío" };

    await addTicketComment(ticketId, user.id, message);
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch(e: any) {
    return { error: e.message };
  }
}
