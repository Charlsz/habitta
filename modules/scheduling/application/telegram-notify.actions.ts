"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Envía notificación de visita programada al residente por Telegram.
 * Llama a la Edge Function send-telegram-message.
 * Guarda telegram_notified_at en el ticket si la notificación tuvo éxito.
 */
export async function notifyScheduledVisit(params: {
  ticketId: string;
  ticketTitle: string;
  startTime: string;   // ISO string
  technicianName: string;
}) {
  const supabase = await createClient();

  // Buscar telegram_session_id del ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .select("telegram_session_id")
    .eq("id", params.ticketId)
    .single();

  if (ticketErr || !ticket?.telegram_session_id) return { skipped: true };

  // Obtener telegram_chat_id de la sesión
  const { data: session, error: sessionErr } = await supabase
    .from("chat_sessions")
    .select("telegram_chat_id")
    .eq("id", ticket.telegram_session_id)
    .single();

  if (sessionErr || !session?.telegram_chat_id) return { skipped: true };

  const date = new Date(params.startTime);
  const dateStr = date.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const message =
    `📅 *Visita programada*\n\n` +
    `🏷 Caso: *${params.ticketTitle}*\n` +
    `📆 Fecha: *${dateStr}*\n` +
    `🕐 Hora: *${timeStr}*\n` +
    `👷 Técnico: *${params.technicianName}*\n\n` +
    `Si necesitas reprogramar, contáctanos por este medio.`;

  // Llamar a la Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(`${supabaseUrl}/functions/v1/send-telegram-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ chat_id: session.telegram_chat_id, message }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[notifyScheduledVisit] Error Telegram:", err);
    return { error: err };
  }

  // Guardar timestamp en el ticket
  await supabase
    .from("tickets")
    .update({ telegram_notified_at: new Date().toISOString() })
    .eq("id", params.ticketId);

  return { ok: true };
}
