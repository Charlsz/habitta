import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getDashboardMetrics } from "@/modules/dashboard/infrastructure/dashboard.repository";
import {
  TicketStatusBadge,
  TicketPriorityBadge,
} from "@/modules/tickets/presentation/ticket-badge";
import { StatusBarChart } from "@/modules/dashboard/presentation/dashboard-chart";
import {
  Ticket, AlertCircle, CheckCircle2,
  CalendarClock, UserX, Building2, ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: orgId } = await searchParams;

  // Guard: si no hay ?org= válido, volver a Organizaciones
  if (!orgId) redirect("/organizations");

  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);
  const currentOrg = orgs.find((o) => o.id === orgId);
  if (!currentOrg) redirect("/organizations");

  const metrics = await getDashboardMetrics(currentOrg.id);

  const chartData = [
    { name: "Abiertos",       count: metrics.openTickets,     color: "#3b82f6" },
    { name: "Resueltos",      count: metrics.resolvedTickets,  color: "#10b981" },
    {
      name: "Pdt. Atención",
      count: metrics.totalTickets - metrics.openTickets - metrics.resolvedTickets,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Panel General
        </h1>
        <p className="text-sm text-[var(--foreground)]/60 mt-0.5">
          Resumen operativo para <strong className="text-[var(--foreground)]/80">{currentOrg.name}</strong>
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Total Tickets"     value={metrics.totalTickets}     icon={<Ticket        className="w-4 h-4" />} />
        <KPICard label="Abiertos"          value={metrics.openTickets}      icon={<AlertCircle   className="w-4 h-4" />} />
        <KPICard label="Resueltos"         value={metrics.resolvedTickets}  icon={<CheckCircle2  className="w-4 h-4 text-emerald-500" />} />
        <KPICard label="Eventos Pend."     value={metrics.pendingEvents}    icon={<CalendarClock className="w-4 h-4 text-amber-500" />} />
        <KPICard label="Sin Asignar"       value={metrics.unassignedTickets}icon={<UserX         className="w-4 h-4 text-red-400" />}
          warn={metrics.unassignedTickets > 0} />
        <Link
          href={`/tickets?org=${currentOrg.id}&sla=at_risk`}
          className={[
            "habitta-card p-4 flex flex-col gap-3 transition-all hover:shadow-md",
            metrics.atRiskCount > 0 ? "ring-2 ring-red-300" : "",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--foreground)]/50">En riesgo SLA</span>
            <ShieldAlert className={`w-4 h-4 ${metrics.atRiskCount > 0 ? "text-red-400" : "text-[var(--foreground)]/30"}`} />
          </div>
          <p className={`text-3xl font-bold ${metrics.atRiskCount > 0 ? "text-red-500" : "text-[var(--foreground)]"}`}>
            {metrics.atRiskCount}
          </p>
          <p className="text-xs text-[var(--foreground)]/40">Ver tickets →</p>
        </Link>
      </div>

      {/* CHART + ACTIVIDAD RECIENTE */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Chart */}
        <div className="habitta-card-high p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Distribución de Tickets</h2>
          <StatusBarChart data={chartData} />
        </div>

        {/* Actividad reciente */}
        <div className="habitta-card-high overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Actividad Reciente</h2>
            <Link href={`/tickets?org=${currentOrg.id}`} className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">
              Ver todos →
            </Link>
          </div>

          {metrics.recentTickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--foreground)]/40">
              No hay tickets registrados aún.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {metrics.recentTickets.map((t: any) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}?org=${currentOrg.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[var(--surface)] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--foreground)]/40">
                          {new Date(t.created_at).toLocaleDateString("es-ES", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {!t.assigned_to && (
                          <span className="text-[10px] font-semibold bg-red-50 text-red-400 px-1.5 py-0.5 rounded-md">
                            Sin asignar
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TicketPriorityBadge priority={t.priority as any} />
                      <TicketStatusBadge   status={t.status as TicketStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* TOP UNIDADES */}
      <TopAssets items={metrics.topAssetsByTickets} orgId={currentOrg.id} />
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────── */

function KPICard({
  label, value, icon, warn = false,
}: {
  label: string; value: number; icon: React.ReactNode; warn?: boolean;
}) {
  return (
    <div className={`habitta-card p-4 flex flex-col gap-3 ${
      warn ? "ring-2 ring-red-300" : ""
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--foreground)]/50">{label}</span>
        <span className="text-[var(--foreground)]/40">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${warn ? "text-red-500" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

function TopAssets({
  items, orgId,
}: {
  items: { asset_name: string; ticket_count: number }[];
  orgId: string;
}) {
  const filtered = items.filter((i) => i.ticket_count > 0);
  const max = filtered[0]?.ticket_count ?? 1;

  return (
    <div className="habitta-card-high overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
        <Building2 className="w-4 h-4 text-[var(--foreground)]/40" />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Unidades con más incidencias</h2>
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-[var(--foreground)]/40">
          Ninguna unidad tiene solicitudes registradas aún.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {filtered.map((item, idx) => {
            const pct   = Math.round((item.ticket_count / max) * 100);
            const isTop = idx === 0;
            return (
              <li key={item.asset_name} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  isTop ? "bg-[#d4a373] text-white" : "bg-[var(--surface)] text-[var(--foreground)]/40"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.asset_name}</p>
                  <div className="mt-1 h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isTop ? "bg-[#d4a373]" : "bg-[var(--foreground)]/20"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isTop ? "bg-[#d4a373]/15 text-[#c8935f]" : "bg-[var(--surface)] text-[var(--foreground)]/40"
                }`}>
                  {item.ticket_count} sol.
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
