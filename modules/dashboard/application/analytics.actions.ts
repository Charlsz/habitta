"use server";

import { createClient } from "@/lib/supabase/server";

export interface AnalyticsData {
  ticketsByType: { type: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  weeklyVolume: { week: string; count: number }[];
  statCards: {
    totalOpen: number;
    closedThisMonth: number;
    urgentOpen: number;
    avgResolutionHours: number | null;
  };
  topLocations: { location: string; count: number }[];
}

export async function getAnalyticsData(orgId: string): Promise<AnalyticsData> {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 12 semanas atrás
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: all } = await supabase
    .from("tickets")
    .select("id, type, priority, status, created_at, updated_at, title")
    .eq("organization_id", orgId);

  const tickets = all ?? [];

  // --- Tickets por tipo (mes actual) ---
  const thisMonth = tickets.filter((t) => t.created_at >= startOfMonth);
  const TYPES = ["incidencia", "mantenimiento", "novedad_obra", "pqr", "solicitud_administrativa", "solicitud_visita", "queja_operativa", "requerimiento_documental"];
  const ticketsByType = TYPES.map((type) => ({
    type,
    count: thisMonth.filter((t) => t.type === type).length,
  })).filter((t) => t.count > 0);

  // --- Tickets por prioridad (mes actual) ---
  const PRIORITIES = ["urgent", "high", "medium", "low"];
  const ticketsByPriority = PRIORITIES.map((priority) => ({
    priority,
    count: thisMonth.filter((t) => t.priority === priority).length,
  }));

  // --- Volumen semanal últimas 12 semanas ---
  const weeklyVolume: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd   = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const count = tickets.filter((t) => {
      const d = new Date(t.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    weeklyVolume.push({ week: label, count });
  }

  // --- Stat cards ---
  const totalOpen = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const closedThisMonth = tickets.filter((t) => t.status === "closed" && t.updated_at >= startOfMonth).length;
  const urgentOpen = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length;

  const closedWithDates = tickets.filter((t) => t.status === "closed" && t.created_at && t.updated_at);
  const avgResolutionHours =
    closedWithDates.length > 0
      ? Math.round(
          closedWithDates.reduce((sum, t) => {
            const diff = new Date(t.updated_at).getTime() - new Date(t.created_at).getTime();
            return sum + diff / (1000 * 60 * 60);
          }, 0) / closedWithDates.length
        )
      : null;

  // --- Top 5 ubicaciones (extraídas del título: texto después de " - ") ---
  const locationMap: Record<string, number> = {};
  for (const t of tickets) {
    const parts = t.title?.split(" - ");
    if (parts && parts.length >= 2) {
      const loc = parts.slice(1).join(" - ").trim();
      if (loc) locationMap[loc] = (locationMap[loc] ?? 0) + 1;
    }
  }
  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  return {
    ticketsByType,
    ticketsByPriority,
    weeklyVolume,
    statCards: { totalOpen, closedThisMonth, urgentOpen, avgResolutionHours },
    topLocations,
  };
}
