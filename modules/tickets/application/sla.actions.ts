"use server";

import { createClient } from "@/lib/supabase/server";
import { getSLAResult, type SLAResult } from "@/lib/sla";

/** Retorna el SLA status para un ticket individual */
export async function getSLAStatus(ticketId: string): Promise<SLAResult | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("priority, created_at, status")
    .eq("id", ticketId)
    .single();
  if (!data) return null;
  return getSLAResult(data.priority, data.created_at, data.status);
}

/** Cuenta tickets at_risk + overdue para una org (usa la RPC) */
export async function getAtRiskCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_tickets_by_sla_urgency", { p_organization_id: orgId });

  if (!data) return 0;
  const now = Date.now();
  return (data as any[]).filter((t) => {
    const sla = getSLAResult(t.priority, t.created_at, t.status);
    return sla && (sla.status === "at_risk" || sla.status === "overdue");
  }).length;
}
