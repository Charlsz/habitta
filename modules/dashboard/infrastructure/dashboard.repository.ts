import { createClient } from "@/modules/core/infrastructure/supabase/server";

export async function getDashboardMetrics(organizationId: string) {
  const supabase = await createClient();

  const [
    { count: totalTickets },
    { count: openTickets },
    { count: resolvedTickets },
    { count: pendingEvents },
    { count: unassignedTickets },
    { data: recentTickets },
  ] = await Promise.all([
    supabase.from("tickets").select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase.from("tickets").select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId).eq("status", "open"),
    supabase.from("tickets").select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId).eq("status", "resolved"),
    supabase.from("events").select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId).eq("status", "pending"),
    // Tickets abiertos sin responsable asignado
    supabase.from("tickets").select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "open")
      .is("assigned_to", null),
    supabase.from("tickets")
      .select("id, title, status, priority, created_at, assigned_to, profiles!tickets_creator_id_fkey (full_name)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalTickets:      totalTickets      ?? 0,
    openTickets:       openTickets       ?? 0,
    resolvedTickets:   resolvedTickets   ?? 0,
    pendingEvents:     pendingEvents     ?? 0,
    unassignedTickets: unassignedTickets ?? 0,
    recentTickets:     recentTickets     ?? [],
  };
}
