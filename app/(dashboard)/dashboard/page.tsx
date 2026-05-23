import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getDashboardMetrics } from "@/modules/dashboard/infrastructure/dashboard.repository";
import { TicketStatusBadge, TicketPriorityBadge } from "@/modules/tickets/presentation/ticket-badge";
import { StatusBarChart } from "@/modules/dashboard/presentation/dashboard-chart";
import { Ticket, AlertCircle, CheckCircle2, CalendarClock } from "lucide-react";
import Link from "next/link";
import { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

export default async function DashboardPage({ searchParams }: { searchParams: { org?: string } }) {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);
  
  const currentOrgId = searchParams.org || orgs[0]?.id;
  const currentOrg = orgs.find(o => o.id === currentOrgId);

  // Si no pertenece a nada, mostramos empty state
  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">¡Bienvenido a Habitta!</h2>
        <p className="text-gray-500">Para ver tu dashboard necesitas unirte o crear una organización.</p>
        <Link href="/organizations/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">Crear Organización</Link>
      </div>
    );
  }

  // Traer métricas usando Promise.all para máxima velocidad
  const metrics = await getDashboardMetrics(currentOrgId);

  // Data para Recharts
  const chartData = [
    { name: "Abiertos", count: metrics.openTickets, color: "#3b82f6" },
    { name: "Resueltos", count: metrics.resolvedTickets, color: "#10b981" },
    { name: "Pdt. Atención", count: (metrics.totalTickets - metrics.openTickets - metrics.resolvedTickets), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & SELECTOR DE ORG */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen operativo para <strong>{currentOrg?.name}</strong></p>
        </div>
        
        {orgs.length > 1 && (
          <form className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-lg shadow-sm">
            <span className="text-xs font-semibold text-gray-500">ORG:</span>
            <select name="org" defaultValue={currentOrgId} onChange="this.form.submit()" className="text-sm font-medium outline-none bg-transparent">
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </form>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIBox title="Total Tickets" value={metrics.totalTickets} icon={<Ticket className="w-5 h-5 text-gray-500" />} />
        <KPIBox title="Tickets Abiertos" value={metrics.openTickets} icon={<AlertCircle className="w-5 h-5 text-blue-500" />} />
        <KPIBox title="Tickets Resueltos" value={metrics.resolvedTickets} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
        <KPIBox title="Eventos Pendientes" value={metrics.pendingEvents} icon={<CalendarClock className="w-5 h-5 text-yellow-500" />} />
      </div>

      {/* CHARTS Y ACTIVIDAD RECIENTE */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* GRÁFICA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-gray-900 border-b pb-2">Distribución de Tickets</h3>
          <StatusBarChart data={chartData} />
        </div>

        {/* TABLA RECIENTE (2 Columnas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Actividad Reciente (Últimos Tickets)</h3>
            <Link href="/tickets" className="text-xs text-blue-600 font-medium hover:underline">Ver todos →</Link>
          </div>
          
          <div className="divide-y">
            {metrics.recentTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No hay tickets registrados aún.</div>
            ) : (
              metrics.recentTickets.map(ticket => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block p-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{ticket.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </p>
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

// Sub-componente simple para las tarjetas KPI
function KPIBox({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-5 bg-white rounded-xl border shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}