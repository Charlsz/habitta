"use server";

import { revalidatePath } from "next/cache";
import { ticketSchema, TicketStatus } from "../domain/ticket.schema";
import {
  createTicket,
  uploadTicketAttachment,
  updateTicketStatus,
  respondToTicket,
  assignTicket,
  addTicketComment,
  getTicketOrganizationId,
} from "../infrastructure/ticket.repository";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";
import { assetBelongsToOrganization } from "@/modules/assets/infrastructure/asset.repository";

export async function createTicketAction(formData: FormData) {
  try {
    const user    = await requireAuth();
    const rawData = Object.fromEntries(formData.entries());
    const orgId   = String(rawData.organization_id);

    const data = {
      organization_id: orgId,
      asset_id:    rawData.asset_id    ? String(rawData.asset_id)    : undefined,
      title:       String(rawData.title),
      description: String(rawData.description),
      priority:    String(rawData.priority),
      due_date:    rawData.due_date    ? String(rawData.due_date)    : undefined,
    };

    const parsed = ticketSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos del ticket inv\u00e1lidos" };

    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    if (parsed.data.asset_id) {
      const assetIsValid = await assetBelongsToOrganization(parsed.data.asset_id, orgId);
      if (!assetIsValid) return { error: "El activo seleccionado no pertenece a esta organizaci\u00f3n" };
    }

    const newTicket = await createTicket(parsed.data, user.id);

    const file = formData.get("attachment") as File;
    if (file && file.size > 0) {
      await uploadTicketAttachment(file, orgId, newTicket.id, user.id);
    }

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true, ticketId: newTicket.id };
  } catch (error: any) {
    return { error: error.message || "Ocurri\u00f3 un error al crear el ticket" };
  }
}

export async function changeTicketStatusAction(ticketId: string, status: TicketStatus) {
  try {
    await requireAuth();
    const orgId = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin", "member"]);
    await updateTicketStatus(ticketId, status);
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function respondToTicketAction(formData: FormData) {
  try {
    const ticketId = String(formData.get("ticket_id"));
    const orgId    = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);
    const response = String(formData.get("response") ?? "").trim();
    if (!response) return { error: "La respuesta no puede estar vac\u00eda" };
    await respondToTicket(ticketId, response);
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function assignTicketAction(formData: FormData) {
  try {
    const ticketId   = String(formData.get("ticket_id"));
    const assignedTo = formData.get("assigned_to");
    const orgId      = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);
    // Si el select es "" (sin asignar), pasamos null para limpiar
    await assignTicket(ticketId, assignedTo && String(assignedTo) !== "" ? String(assignedTo) : null);
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function addTicketCommentAction(formData: FormData) {
  try {
    const user     = await requireAuth();
    const ticketId = formData.get("ticket_id") as string;
    const message  = formData.get("message")   as string;

    if (!message || message.trim().length === 0) return { error: "Mensaje vac\u00edo" };

    const orgId = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    await addTicketComment(ticketId, user.id, message);
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
