import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { getSLAResult } from "@/lib/sla";

export async function getDashboardMetrics(organizationId: string) {
  const supabase = await createClient();

  const [
    { count: totalTickets },
    { count: openTickets },
    { count: resolvedTickets },
    { count: pendingEvents },
    { count: unassignedTickets },
    { data: recentTickets },
    { data: topAssets },
    { data: slaTickets },
  ] = await Promise.all([
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "open"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "resolved"),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "pending"),
    supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "open")
      .is("assigned_to", null),
    supabase
      .from("tickets")
      .select(
        "id, title, status, priority, created_at, assigned_to, profiles!tickets_creator_id_fkey (full_name)"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.rpc("get_top_assets_by_tickets", {
      p_organization_id: organizationId,
      p_limit: 5,
    }),
    // Tickets activos para cálculo SLA
    supabase
      .from("tickets")
      .select("id, priority, status, created_at")
      .eq("organization_id", organizationId)
      .not("status", "in", "(closed,resolved)"),
  ]);

  // Contar at_risk + overdue en memoria
  const atRiskCount = (slaTickets ?? []).filter((t: any) => {
    const sla = getSLAResult(t.priority, t.created_at, t.status);
    return sla && (sla.status === "at_risk" || sla.status === "overdue");
  }).length;

  return {
    totalTickets:       totalTickets      ?? 0,
    openTickets:        openTickets       ?? 0,
    resolvedTickets:    resolvedTickets   ?? 0,
    pendingEvents:      pendingEvents     ?? 0,
    unassignedTickets:  unassignedTickets ?? 0,
    recentTickets:      recentTickets     ?? [],
    topAssetsByTickets: (topAssets ?? []) as { asset_name: string; ticket_count: number }[],
    atRiskCount,
  };
}
