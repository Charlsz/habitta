"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireOrgRole } from "@/modules/auth/application/auth.guard";
import { revalidatePath } from "next/cache";

const CATEGORY_HEADERS: Record<string, string> = {
  announcement: "📢 *Comunicado*",
  maintenance:  "🔧 *Mantenimiento*",
  services:     "💧 *Servicios*",
  emergency:    "🚨 *EMERGENCIA*",
};

export interface BroadcastResult {
  sent: number;
  failed: number;
  error?: string;
}

export async function sendBroadcastAction(
  orgId: string,
  rawMessage: string,
  category: string
): Promise<BroadcastResult> {
  const user = await requireAuth();
  await requireOrgRole(orgId, ["owner", "admin"]);

  const supabase = await createClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Construir mensaje con cabecera de categoría
  const header = CATEGORY_HEADERS[category] ?? CATEGORY_HEADERS.announcement;
  const fullMessage = `${header}\n\n${rawMessage.trim()}`;

  // Obtener todos los chat_sessions de la org con telegram_chat_id
  const { data: sessions, error: sessErr } = await supabase
    .from("chat_sessions")
    .select("id, telegram_chat_id, display_name")
    .eq("organization_id", orgId)
    .not("telegram_chat_id", "is", null);

  if (sessErr) return { sent: 0, failed: 0, error: sessErr.message };
  if (!sessions || sessions.length === 0) return { sent: 0, failed: 0, error: "no_recipients" };

  let sent = 0;
  let failed = 0;

  for (const session of sessions) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-telegram-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ chat_id: session.telegram_chat_id, message: fullMessage }),
      });
      if (res.ok) { sent++; } else { failed++; }
    } catch {
      failed++;
    }
    // 100 ms entre llamadas para evitar rate limiting de Telegram
    await new Promise((r) => setTimeout(r, 100));
  }

  // Registrar el broadcast en la tabla
  await supabase.from("telegram_broadcasts").insert({
    organization_id: orgId,
    message: fullMessage,
    category,
    recipient_count: sent,
    sent_by: user.id,
  });

  revalidatePath("/notifications/broadcast");
  return { sent, failed };
}

export async function getBroadcastHistory(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("telegram_broadcasts")
    .select("id, message, category, recipient_count, sent_at")
    .eq("organization_id", orgId)
    .order("sent_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function getRecipientCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .not("telegram_chat_id", "is", null);
  return count ?? 0;
}
