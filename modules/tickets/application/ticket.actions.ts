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
import { SLA_HOURS } from "@/lib/sla";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "🔴 Urgente",
  high:   "🟠 Alta",
  medium: "🟡 Media",
  low:    "🟢 Baja",
};

// ── AI: decide prioridad y razón ─────────────────────────────────────────────
async function aiDecidePriority(
  title: string,
  description: string
): Promise<{ priority: string; reason: string }> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("No OPENAI_API_KEY");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              `Eres el sistema de priorización de tickets de Habitta, una plataforma de gestión residencial.\n` +
              `Clasifica el ticket según estas reglas:\n` +
              `- urgent: Riesgo de vida, incendio, inundación, falla eléctrica grave, robo activo. SLA: 2h.\n` +
              `- high: Corte de servicios (agua, gas, electricidad), ascensor dañado, seguridad comprometida. SLA: 24h.\n` +
              `- medium: Daños visibles no urgentes, solicitudes de mantenimiento, problemas de ruido reiterados. SLA: 72h.\n` +
              `- low: Consultas, sugerencias, mejoras estéticas. SLA: 7 días.\n` +
              `Responde SOLO JSON: { "priority": "urgent|high|medium|low", "reason": "explicación breve en español de máx 120 caracteres" }`,
          },
          { role: "user", content: `Título: ${title}\n\nDescripción: ${description}` },
        ],
      }),
    });

    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    if (["urgent", "high", "medium", "low"].includes(parsed.priority)) {
      return { priority: parsed.priority, reason: parsed.reason ?? "" };
    }
  } catch { /* fallback */ }

  return { priority: "medium", reason: "Prioridad asignada por defecto (IA no disponible)." };
}

// ── Create ticket ─────────────────────────────────────────────────────────────
export async function createTicketAction(formData: FormData) {
  try {
    const user    = await requireAuth();
    const rawData = Object.fromEntries(formData.entries());
    const orgId   = String(rawData.organization_id);

    const title       = String(rawData.title);
    const description = String(rawData.description);

    // IA decide prioridad (ignora lo que venga del formulario)
    const { priority: aiPriority, reason: aiReason } = await aiDecidePriority(title, description);

    const data = {
      organization_id: orgId,
      asset_id:    rawData.asset_id    ? String(rawData.asset_id)    : undefined,
      category_id: rawData.category_id ? String(rawData.category_id) : undefined,
      title,
      description,
      priority:  aiPriority,
      due_date:  rawData.due_date ? String(rawData.due_date) : undefined,
    };

    const parsed = ticketSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos del ticket inválidos" };

    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    if (parsed.data.asset_id) {
      const assetIsValid = await assetBelongsToOrganization(parsed.data.asset_id, orgId);
      if (!assetIsValid) return { error: "El activo seleccionado no pertenece a esta organización" };
    }

    const newTicket = await createTicket(
      { ...parsed.data, category_id: data.category_id ?? null },
      user.id
    );

    // Comentario automático de la IA explicando la prioridad
    const slaHours = SLA_HOURS[aiPriority] ?? 72;
    const slaText  =
      slaHours < 24
        ? `${slaHours} hora${slaHours > 1 ? "s" : ""}`
        : slaHours < 168
        ? `${slaHours / 24} día${slaHours / 24 > 1 ? "s" : ""}`
        : "7 días";

    await addTicketComment(
      newTicket.id,
      user.id,
      `🤖 **Prioridad asignada por IA: ${PRIORITY_LABEL[aiPriority]}**\n` +
        `${aiReason}\n` +
        `Tiempo de resolución esperado: ${slaText}.`
    ).catch(() => {});

    const file = formData.get("attachment") as File;
    if (file && file.size > 0) {
      await uploadTicketAttachment(file, orgId, newTicket.id, user.id);
    }

    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: newTicket.id,
      action: "created",
      newValue: { title, priority: aiPriority, status: "open" },
    });

    const prioLabel = PRIORITY_LABEL[aiPriority] ?? aiPriority;
    if (aiPriority === "urgent") {
      notifyOrgAdmins(orgId, `🚨 Ticket urgente: ${title}`, `Prioridad ${prioLabel} — requiere atención inmediata.`, "error").catch(() => {});
    } else if (aiPriority === "high") {
      notifyOrgAdmins(orgId, `⚠️ Ticket de alta prioridad: ${title}`, `Prioridad ${prioLabel} — revísalo pronto.`, "warning").catch(() => {});
    } else {
      notifyOrgAdmins(orgId, `🎫 Nuevo ticket: ${title}`, `Prioridad ${prioLabel} — pendiente de revisión.`, "info").catch(() => {});
    }

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true, ticketId: newTicket.id };
  } catch (error: any) {
    return { error: error.message || "Ocurrió un error al crear el ticket" };
  }
}

// ── Change priority (admin) ───────────────────────────────────────────────────
export async function changeTicketPriorityAction(ticketId: string, priority: string) {
  try {
    const user  = await requireAuth();
    const orgId = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);

    const admin = getAdmin();
    const { data: t } = await admin
      .from("tickets")
      .select("priority, title, creator_id")
      .eq("id", ticketId)
      .single();

    await admin.from("tickets").update({ priority }).eq("id", ticketId);

    const slaHours = SLA_HOURS[priority] ?? 72;
    const slaText  =
      slaHours < 24
        ? `${slaHours} hora${slaHours > 1 ? "s" : ""}`
        : slaHours < 168
        ? `${slaHours / 24} día${slaHours / 24 > 1 ? "s" : ""}`
        : "7 días";

    // Comentario automático del cambio manual
    await addTicketComment(
      ticketId,
      user.id,
      `👤 **Prioridad cambiada manualmente a ${PRIORITY_LABEL[priority]}**\n` +
        `El administrador ajustó la prioridad. Nuevo tiempo de resolución esperado: ${slaText}.`
    ).catch(() => {});

    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "priority_changed",
      oldValue: { priority: t?.priority },
      newValue: { priority },
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ── Change status ─────────────────────────────────────────────────────────────
export async function changeTicketStatusAction(ticketId: string, status: TicketStatus) {
  try {
    const user  = await requireAuth();
    const orgId = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin", "member"]);

    let previousStatus: string | null = null;
    let ticketTitle:    string | null = null;
    let creatorId:      string | null = null;
    try {
      const admin = getAdmin();
      const { data: t } = await admin.from("tickets").select("status, title, creator_id").eq("id", ticketId).single();
      previousStatus = t?.status    ?? null;
      ticketTitle    = t?.title     ?? null;
      creatorId      = t?.creator_id ?? null;
    } catch { /* continuar */ }

    await updateTicketStatus(ticketId, status);

    createAuditLog({
      orgId, userId: user.id, entityType: "ticket", entityId: ticketId,
      action: "status_changed",
      oldValue: previousStatus ? { status: previousStatus } : null,
      newValue: { status },
    });

    if (status === "resolved" && creatorId && ticketTitle) {
      createNotification(orgId, creatorId, `✅ Ticket resuelto: ${ticketTitle}`, `El ticket ha sido marcado como resuelto.`, "success").catch(() => {});
    }
    if (status === "closed" && creatorId && ticketTitle) {
      createNotification(orgId, creatorId, `📦 Ticket cerrado: ${ticketTitle}`, `El ticket fue cerrado definitivamente.`, "info").catch(() => {});
    }
    if (status === "rejected") {
      notifyOrgAdmins(orgId, `❌ Ticket rechazado: ${ticketTitle ?? ticketId}`, `Un ticket fue marcado como rechazado.`, "warning").catch(() => {});
    }

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ── Respond ───────────────────────────────────────────────────────────────────
export async function respondToTicketAction(formData: FormData) {
  try {
    const user     = await requireAuth();
    const ticketId = String(formData.get("ticket_id"));
    const orgId    = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);
    const response = String(formData.get("response") ?? "").trim();
    if (!response) return { error: "La respuesta no puede estar vacía" };

    await respondToTicket(ticketId, response);

    try {
      const admin = getAdmin();
      const { data: t } = await admin.from("tickets").select("creator_id, title").eq("id", ticketId).single();
      if (t?.creator_id) {
        createNotification(orgId, t.creator_id, `💬 Respuesta en tu ticket: ${t.title}`, `El equipo ha respondido a tu solicitud.`, "info").catch(() => {});
      }
    } catch { /* no bloquear */ }

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

// ── Assign ────────────────────────────────────────────────────────────────────
export async function assignTicketAction(formData: FormData) {
  try {
    const user       = await requireAuth();
    const ticketId   = String(formData.get("ticket_id"));
    const assignedTo = formData.get("assigned_to");
    const orgId      = await getTicketOrganizationId(ticketId);
    await requireOrgRole(orgId, ["owner", "admin"]);

    const newAssignee = assignedTo && String(assignedTo) !== "" ? String(assignedTo) : null;
    await assignTicket(ticketId, newAssignee);

    if (newAssignee) {
      try {
        const admin = getAdmin();
        const { data: t } = await admin.from("tickets").select("title").eq("id", ticketId).single();
        if (t?.title) {
          createNotification(orgId, newAssignee, `👤 Se te asignó un ticket: ${t.title}`, `Tienes un nuevo ticket asignado.`, "info").catch(() => {});
        }
      } catch { /* no bloquear */ }
    }

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

// ── Add comment ───────────────────────────────────────────────────────────────
export async function addTicketCommentAction(formData: FormData) {
  try {
    const user     = await requireAuth();
    const ticketId = formData.get("ticket_id") as string;
    const message  = formData.get("message")   as string;
    if (!message || message.trim().length === 0) return { error: "Mensaje vacío" };

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
