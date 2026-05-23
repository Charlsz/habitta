import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export type AuditAction =
  | "created"
  | "updated"
  | "status_changed"
  | "assigned"
  | "commented"
  | "responded"
  | "deleted";

export interface AuditLog {
  id:              string;
  organization_id: string | null;
  user_id:         string | null;
  entity_type:     string;
  entity_id:       string;
  action:          AuditAction;
  old_value:       Record<string, unknown> | null;
  new_value:       Record<string, unknown> | null;
  created_at:      string;
  /** JOIN profiles */
  profiles?:       { full_name: string } | null;
}

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Inserta un audit log vía RPC SECURITY DEFINER.
 * Fire-and-forget: nunca lanza error para no bloquear la acción principal.
 */
export async function createAuditLog(params: {
  orgId:      string;
  userId:     string;
  entityType: string;
  entityId:   string;
  action:     AuditAction;
  oldValue?:  Record<string, unknown> | null;
  newValue?:  Record<string, unknown> | null;
}): Promise<void> {
  try {
    const admin = getAdmin();
    await admin.rpc("create_audit_log", {
      p_org_id:      params.orgId,
      p_user_id:     params.userId,
      p_entity_type: params.entityType,
      p_entity_id:   params.entityId,
      p_action:      params.action,
      p_old_value:   params.oldValue  ?? null,
      p_new_value:   params.newValue  ?? null,
    });
  } catch {
    // Fallo silencioso
  }
}

/** Historial de un entity concreto, ordenado por fecha desc, JOIN profiles */
export async function getAuditLogs(
  entityId:   string,
  entityType: string,
  limit = 50
): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, profiles (full_name)")
    .eq("entity_type", entityType)
    .eq("entity_id",   entityId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditLog[];
}
