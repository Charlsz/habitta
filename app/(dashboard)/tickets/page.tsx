import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { getTickets } from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import Link from "next/link";
import { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

export default async function TicketsPage({ searchParams }: { searchParams: { status?: string, asset?: string, org?: string } }) {
  const user = await requireAuth();
  
  // Para la demo de la hackathon: traemos las orgs del usuario
  const orgs = await getOrganizations(user.id);
  const selectedOrg = searchParams.org || orgs[0]?.id;
  
  // Traemos tickets de esa org filtrados
  const tickets = selectedOrg ? await getTickets(selectedOrg, { 
    status: searchParams.status, 
    asset_id: searchParams.asset 
  }) : [];

  // Assets de la org actual para el filtro
  const assets = selectedOrg ? await getAssetsByOrganization(selectedOrg) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Registra y atiende incidencias o PQRs.</p>
        </div>
        <Link 
          href="/tickets/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm shadow-sm"
        >
          + Levantar Ticket
        </Link>
      </div>

      {/* Barra de Filtros SSR */}
      <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-4 items-end shadow-sm">
        <form className="flex flex-wrap gap-4 w-full">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Organización</label>
            <select name="org" defaultValue={selectedOrg} className="block w-48 mt-1 border-gray-300 rounded-md text-sm border p-2">
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
            <select name="status" defaultValue={searchParams.status || "all"} className="block w-40 mt-1 border-gray-300 rounded-md text-sm border p-2">
              <option value="all">Todos</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resueltos</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Activo</label>
            <select name="asset" defaultValue={searchParams.asset || "all"} className="block w-48 mt-1 border-gray-300 rounded-md text-sm border p-2">
              <option value="all">Todos los activos</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex-1 flex justify-end">
            <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm px-4 py-2 rounded-md self-end">
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border shadow-sm">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay tickets que coincidan con estos criterios.
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((t: any) => (
              <Link href={`/tickets/${t.id}`} key={t.id} className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <TicketStatusBadge status={t.status as TicketStatus} />
                    <TicketPriorityBadge priority={t.priority} />
                    <span className="text-xs text-gray-400">Hace 2h • Por {t.profiles?.full_name || 'Usuario'}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{t.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1 mt-1">{t.description}</p>
                </div>
                {t.assets && (
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">
                      📍 {t.assets.name}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}