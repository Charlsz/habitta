"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendTelegramReplyAction(formData: FormData) {
  const ticket_id = formData.get("ticket_id") as string;
  const message = formData.get("message") as string;

  if (!ticket_id || !message?.trim()) {
    throw new Error("Faltan datos requeridos");
  }

  // 1. Obtener el ticket con su sesión de telegram
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, title, organization_id, telegram_session_id")
    .eq("id", ticket_id)
    .single();

  if (ticketError || !ticket) throw new Error("Ticket no encontrado");
  if (!ticket.telegram_session_id) throw new Error("Este ticket no tiene sesión de Telegram");

  // 2. Obtener el chat_id del residente
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("telegram_chat_id, display_name")
    .eq("id", ticket.telegram_session_id)
    .single();

  if (sessionError || !session) throw new Error("Sesión de Telegram no encontrada");

  // 3. Obtener nombre de la organización
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", ticket.organization_id)
    .single();

  const orgName = org?.name ?? "el administrador";

  // 4. Enviar mensaje por Telegram
  const telegramMessage = `📨 *Mensaje del administrador de ${orgName}:*

${message.trim()}`;

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: session.telegram_chat_id,
        text: telegramMessage,
        parse_mode: "Markdown",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error enviando mensaje de Telegram: ${err}`);
  }

  // 5. Guardar el mensaje en el historial del chat
  await supabase.from("chat_messages").insert({
    session_id: ticket.telegram_session_id,
    role: "assistant",
    content: `[Admin] ${message.trim()}`,
  });

  revalidatePath(`/tickets/${ticket_id}`);
}
