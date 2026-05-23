import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { getTickets } from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import { CategoryBadge } from "@/modules/ticket-categories/presentation/category-badge";
import Link from "next/link";
import { TicketStatus, TICKET_STATUS_LABELS } from "@/modules/tickets/domain/ticket.schema";

const STATUS_OPTIONS = [
  { value: "all",         label: "Todos" },
  { value: "open",        label: "Abierto" },
  { value: "in_review",   label: "En revisi\u00f3n" },
  { value: "in_progress", label: "En proceso" },
  { value: "on_hold",     label: "En espera" },
  { value: "resolved",    label: "Resuelto" },
  { value: "rejected",    label: "Rechazado" },
  { value: "closed",      label: "Cerrado" },
];

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; asset?: string; org?: string };
}) {
  const user      = await requireAuth();
  const orgs      = await getOrganizations(user.id);
  const selectedOrg = orgs.some((o) => o.id === searchParams.org)
    ? searchParams.org
    : orgs[0]?.id;

  const tickets = selectedOrg
    ? await getTickets(selectedOrg, { status: searchParams.status, asset_id: searchParams.asset })
    : [];
  const assets = selectedOrg ? await getAssetsByOrganization(selectedOrg) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="habitta-title text-3xl">Gesti\u00f3n de Tickets</h1>
          <p className="habitta-muted text-sm mt-1">Registra y atiende incidencias o PQRs.</p>
        </div>
        <Link href="/tickets/new" className="habitta-primary px-4 py-2 text-sm font-medium">
          + Levantar Ticket
        </Link>
      </div>

      {/* Filtros */}
      <div className="habitta-card p-4">
        <form className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs font-semibold habitta-muted uppercase">Organizaci\u00f3n</label>
            <select name="org" defaultValue={selectedOrg} className="block w-48 mt-1 border border-[var(--border)] rounded-md text-sm p-2 bg-white">
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold habitta-muted uppercase">Estado</label>
            <select name="status" defaultValue={searchParams.status || "all"} className="block w-44 mt-1 border border-[var(--border)] rounded-md text-sm p-2 bg-white">
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold habitta-muted uppercase">Activo</label>
            <select name="asset" defaultValue={searchParams.asset || "all"} className="block w-48 mt-1 border border-[var(--border)] rounded-md text-sm p-2 bg-white">
              <option value="all">Todos los activos</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex-1 flex items-end justify-end">
            <button type="submit" className="habitta-secondary px-4 py-2 text-sm">Filtrar</button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="habitta-card overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8 text-center habitta-muted text-sm">
            No hay tickets que coincidan con estos criterios.
          </div>
        ) : (
          <div className="divide-y">
            {(tickets as any[]).map((t) => (
              <Link
                href={`/tickets/${t.id}`}
                key={t.id}
                className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center mb-1 flex-wrap">
                    <TicketStatusBadge   status={t.status as TicketStatus} />
                    <TicketPriorityBadge priority={t.priority} />
                    {t.ticket_categories && (
                      <CategoryBadge
                        name={t.ticket_categories.name}
                        color={t.ticket_categories.color}
                      />
                    )}
                    {t.assignee?.full_name ? (
                      <span className="text-xs text-[#c8935f] font-medium">\ud83d\udc64 {t.assignee.full_name}</span>
                    ) : (
                      <span className="text-xs text-red-400 font-medium">Sin asignar</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] truncate">{t.title}</h3>
                  <p className="habitta-muted text-sm line-clamp-1 mt-1">{t.description}</p>
                  <p className="text-xs habitta-muted mt-1">Por {t.profiles?.full_name || "Usuario"}</p>
                </div>
                {t.assets && (
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 bg-[var(--surface)] rounded text-[var(--muted)]">
                      \ud83d\udccd {t.assets.name}
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
