"use server";

import { createClient } from "@/lib/supabase/server";
import { getDeadlineResult, type DeadlineResult } from "@/lib/sla";

/** Retorna el estado de tiempo límite para un ticket individual */
export async function getDeadlineStatus(ticketId: string): Promise<DeadlineResult | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("priority, created_at, status")
    .eq("id", ticketId)
    .single();
  if (!data) return null;
  return getDeadlineResult(data.priority, data.created_at, data.status);
}

/** @deprecated usa getDeadlineStatus */
export const getSLAStatus = getDeadlineStatus;

/** Cuenta tickets en riesgo + vencidos para una org */
export async function getAtRiskCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_tickets_by_sla_urgency", { p_organization_id: orgId });

  if (!data) return 0;
  return (data as any[]).filter((t) => {
    const r = getDeadlineResult(t.priority, t.created_at, t.status);
    return r && (r.status === "at_risk" || r.status === "overdue");
  }).length;
}
