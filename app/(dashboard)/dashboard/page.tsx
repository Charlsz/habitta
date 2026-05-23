import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getDashboardMetrics } from "@/modules/dashboard/infrastructure/dashboard.repository";
import { TicketStatusBadge, TicketPriorityBadge } from "@/modules/tickets/presentation/ticket-badge";
import { StatusBarChart } from "@/modules/dashboard/presentation/dashboard-chart";
import { Ticket, AlertCircle, CheckCircle2, CalendarClock, UserX } from "lucide-react";
import Link from "next/link";
import { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

export default async function DashboardPage({ searchParams }: { searchParams: { org?: string } }) {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="habitta-title text-2xl">\u00a1Bienvenido a Habitta!</h2>
        <p className="habitta-muted">Para ver tu dashboard necesitas unirte o crear una organizaci\u00f3n.</p>
        <Link href="/organizations/new" className="habitta-primary px-4 py-2">Crear Organizaci\u00f3n</Link>
      </div>
    );
  }

  const requestedOrg  = searchParams.org;
  const currentOrg    = orgs.find((org) => org.id === requestedOrg) ?? orgs[0];
  const currentOrgId  = currentOrg.id;
  const metrics       = await getDashboardMetrics(currentOrgId);

  const chartData = [
    { name: "Abiertos",      count: metrics.openTickets,     color: "#3b82f6" },
    { name: "Resueltos",     count: metrics.resolvedTickets,  color: "#10b981" },
    { name: "Pdt. Atenci\u00f3n", count: metrics.totalTickets - metrics.openTickets - metrics.resolvedTickets, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="habitta-title text-3xl">Dashboard General</h1>
          <p className="habitta-muted text-sm mt-1">Resumen operativo para <strong>{currentOrg?.name}</strong></p>
        </div>
        {orgs.length > 1 && (
          <form className="habitta-card-high flex items-center gap-2 px-3 py-1.5">
            <span className="text-xs font-semibold text-[var(--muted)]">ORG:</span>
            <select name="org" defaultValue={currentOrgId} className="text-sm font-medium outline-none bg-transparent">
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <button type="submit" className="habitta-secondary px-2 py-1 text-xs">Ver</button>
          </form>
        )}
      </div>

      {/* KPI CARDS — ahora 5 m\u00e9tricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPIBox
          title="Total Tickets"
          value={metrics.totalTickets}
          icon={<Ticket className="w-5 h-5 text-[var(--muted)]" />}
        />
        <KPIBox
          title="Tickets Abiertos"
          value={metrics.openTickets}
          icon={<AlertCircle className="w-5 h-5 text-[var(--accent)]" />}
        />
        <KPIBox
          title="Tickets Resueltos"
          value={metrics.resolvedTickets}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
        />
        <KPIBox
          title="Eventos Pendientes"
          value={metrics.pendingEvents}
          icon={<CalendarClock className="w-5 h-5 text-yellow-500" />}
        />
        <KPIBox
          title="Sin Asignar"
          value={metrics.unassignedTickets}
          icon={<UserX className="w-5 h-5 text-red-400" />}
          highlight={metrics.unassignedTickets > 0}
        />
      </div>

      {/* CHARTS + ACTIVIDAD */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="habitta-card-high lg:col-span-1 p-6 flex flex-col h-full">
          <h3 className="font-bold text-[var(--foreground)] border-b pb-2">Distribuci\u00f3n de Tickets</h3>
          <StatusBarChart data={chartData} />
        </div>

        <div className="habitta-card-high lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b bg-[var(--surface)] flex justify-between items-center">
            <h3 className="font-bold text-[var(--foreground)]">Actividad Reciente</h3>
            <Link href="/tickets" className="habitta-link text-xs">Ver todos \u2192</Link>
          </div>
          <div className="divide-y">
            {metrics.recentTickets.length === 0 ? (
              <div className="p-8 text-center habitta-muted text-sm">No hay tickets registrados a\u00fan.</div>
            ) : (
              metrics.recentTickets.map((ticket: any) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block p-4 hover:bg-[var(--surface)] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-[var(--foreground)] line-clamp-1">{ticket.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--subtle)]">
                          {new Date(ticket.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {!ticket.assigned_to && (
                          <span className="text-xs bg-red-50 text-red-500 font-medium px-1.5 py-0.5 rounded">Sin asignar</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <TicketPriorityBadge priority={ticket.priority as any} />
                      <TicketStatusBadge status={ticket.status as TicketStatus} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIBox({
  title, value, icon, highlight = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`habitta-card p-5 flex flex-col justify-between ${
      highlight ? "ring-2 ring-red-300 ring-offset-1" : ""
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[var(--muted)]">{title}</h3>
        <div className="p-2 bg-[rgba(255,255,255,0.55)] rounded-md">{icon}</div>
      </div>
      <p className={`habitta-title text-3xl ${highlight ? "text-red-500" : ""}`}>{value}</p>
    </div>
  );
}
