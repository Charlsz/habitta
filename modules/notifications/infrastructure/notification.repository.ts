import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Notification, NotificationType } from "../domain/notification.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Notificaciones no leídas del usuario autenticado (usa RLS vía auth.uid()) */
export async function getUnreadNotifications(limit = 5): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_unread_notifications", { p_limit: limit });
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

/** Conteo rápido de no leídas (head-only) */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  if (error) return 0;
  return count ?? 0;
}

/** Marcar todas las notificaciones del usuario como leídas */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin.rpc("mark_notifications_read", { p_user_id: userId });
  if (error) throw new Error(error.message);
}

/**
 * Crear una notificación para un usuario específico.
 * Siempre usa admin client para bypassear RLS.
 */
export async function createNotification(
  orgId:   string | null,
  userId:  string,
  title:   string,
  message: string | null = null,
  type:    NotificationType = "info"
): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin.rpc("create_notification", {
    p_organization_id: orgId,
    p_user_id:         userId,
    p_title:           title,
    p_message:         message,
    p_type:            type,
  });
  if (error) throw new Error(error.message);
}

/**
 * Notificar a todos los owners/admins de una organización.
 * Ignora errores para no bloquear la acción principal.
 */
export async function notifyOrgAdmins(
  orgId:   string,
  title:   string,
  message: string | null = null,
  type:    NotificationType = "info"
): Promise<void> {
  try {
    const admin = getAdmin();
    const { data: members } = await admin
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)
      .in("role", ["owner", "admin"]);

    if (!members || members.length === 0) return;

    await Promise.all(
      members.map((m: { user_id: string }) =>
        createNotification(orgId, m.user_id, title, message, type)
      )
    );
  } catch {
    // No bloquear la acción principal si falla la notificación
  }
}
