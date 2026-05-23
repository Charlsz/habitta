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
import {
  createNotification,
  notifyOrgAdmins,
} from "@/modules/notifications/infrastructure/notification.repository";
import { createAuditLog } from "@/modules/audit/infrastructure/audit.repository";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createTicketAction(formData: FormData) {
  try {
    const user    = await requireAuth();
    const rawData = Object.fromEntries(formData.entries());
    const orgId   = String(rawData.organization_id);

    const data = {
      organization_id: orgId,
      asset_id:    rawData.asset_id    ? String(rawData.asset_id)    : undefined,
      category_id: rawData.category_id ? String(rawData.category_id) : undefined,
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

    const newTicket = await createTicket(
      { ...parsed.data, category_id: data.category_id ?? null },
      user.id
    );

    const file = formData.get("attachment") as File;
    if (file && file.size > 0) {
      await uploadTicketAttachment(file, orgId, newTicket.id, user.id);
    }

    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: newTicket.id,
      action: "created",
      newValue: { title: parsed.data.title, priority: parsed.data.priority, status: "open" },
    });

    notifyOrgAdmins(
      orgId,
      `\ud83c\udfab Nuevo ticket: ${parsed.data.title}`,
      `Creado por un miembro. Revisa los tickets pendientes.`,
      "info"
    ).catch(() => {});

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true, ticketId: newTicket.id };
  } catch (error: any) {
    return { error: error.message || "Ocurri\u00f3 un error al crear el ticket" };
  }
}

export async function changeTicketStatusAction(ticketId: string, status: TicketStatus) {
  try {
    const user  = await requireAuth();
    const orgId = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    let previousStatus: string | null = null;
    try {
      const admin = getAdmin();
      const { data: t } = await admin.from("tickets").select("status").eq("id", ticketId).single();
      previousStatus = t?.status ?? null;
    } catch { /* continuar */ }

    await updateTicketStatus(ticketId, status);

    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "status_changed",
      oldValue: previousStatus ? { status: previousStatus } : null,
      newValue: { status },
    });

    if (status === "resolved") {
      try {
        const admin = getAdmin();
        const { data: ticket } = await admin.from("tickets").select("creator_id, title").eq("id", ticketId).single();
        if (ticket) {
          createNotification(
            orgId, ticket.creator_id,
            "\u2705 Tu ticket fue resuelto",
            `"${ticket.title}" ha sido marcado como resuelto.`,
            "success"
          ).catch(() => {});
        }
      } catch { /* continuar */ }
    }

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
    const user     = await requireAuth();
    const ticketId = String(formData.get("ticket_id"));
    const orgId    = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);
    const response = String(formData.get("response") ?? "").trim();
    if (!response) return { error: "La respuesta no puede estar vac\u00eda" };

    await respondToTicket(ticketId, response);
    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "responded",
      newValue: { response: response.substring(0, 200) },
    });

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function assignTicketAction(formData: FormData) {
  try {
    const user       = await requireAuth();
    const ticketId   = String(formData.get("ticket_id"));
    const assignedTo = formData.get("assigned_to");
    const orgId      = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);

    const newAssignee = assignedTo && String(assignedTo) !== "" ? String(assignedTo) : null;
    await assignTicket(ticketId, newAssignee);
    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "assigned", newValue: { assigned_to: newAssignee },
    });

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
    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "commented", newValue: { message: message.substring(0, 200) },
    });

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
