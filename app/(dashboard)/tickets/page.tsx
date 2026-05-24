import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getActiveOrganizationId } from "@/modules/organizations/application/org.utils";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { getTickets } from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import { SLABadge } from "@/modules/tickets/components/SLABadge";
import Link from "next/link";
import type { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

const STATUS_OPTIONS = [
  { value: "all",         label: "Todos" },
  { value: "open",        label: "Abierto" },
  { value: "in_review",   label: "En revisión" },
  { value: "in_progress", label: "En proceso" },
  { value: "on_hold",     label: "En espera" },
  { value: "resolved",    label: "Resuelto" },
  { value: "rejected",    label: "Rechazado" },
  { value: "closed",      label: "Cerrado" },
];

interface Props {
  searchParams: Promise<{ status?: string; asset?: string; org?: string; sla?: string }>;
}

export default async function TicketsPage({ searchParams }: Props) {
  const params    = await searchParams;
  const user      = await requireAuth();
  const orgId     = await getActiveOrganizationId(user.id, params.org);
  const tickets   = await getTickets(orgId, { status: params.status, asset_id: params.asset });
  const assets    = await getAssetsByOrganization(orgId);

  const select = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Tickets</h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-0.5">Solicitudes, incidencias y PQR.</p>
        </div>
        <Link
          href={`/tickets/new?org=${orgId}`}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#d4a373' }}
        >
          + Nuevo ticket
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
        <input type="hidden" name="org" value={orgId} />
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-[var(--foreground)]/40 uppercase tracking-wider mb-1">Estado</label>
            <select name="status" defaultValue={params.status ?? 'all'} className={select}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-[var(--foreground)]/40 uppercase tracking-wider mb-1">Unidad</label>
            <select name="asset" defaultValue={params.asset ?? 'all'} className={select}>
              <option value="all">Todas las unidades</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-[var(--foreground)]/40 uppercase tracking-wider mb-1">SLA</label>
            <select name="sla" defaultValue={params.sla ?? 'all'} className={select}>
              <option value="all">🟠 Todos</option>
              <option value="overdue">🔴 Vencidos</option>
              <option value="at_risk">🟡 En riesgo</option>
              <option value="on_track">🟢 A tiempo</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--foreground)] hover:border-[#d4a373] transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>
      </form>

      {/* Lista */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-4xl">📋</p>
            <p className="text-sm text-[var(--foreground)]/40">No hay tickets con estos filtros.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {(tickets as any[]).map((t) => (
              <Link
                key={t.id}
                href={`/tickets/${t.id}?org=${orgId}`}
                className="flex gap-4 p-5 hover:bg-[var(--surface)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center flex-wrap mb-1.5">
                    <TicketStatusBadge   status={t.status as TicketStatus} />
                    <TicketPriorityBadge priority={t.priority} />
                    {t.assignee?.full_name ? (
                      <span className="text-xs text-[#d4a373] font-medium">👤 {t.assignee.full_name}</span>
                    ) : (
                      <span className="text-xs text-[var(--foreground)]/30 font-medium">Sin asignar</span>
                    )}
                    <SLABadge priority={t.priority} createdAt={t.created_at} status={t.status} />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[#d4a373] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-sm text-[var(--foreground)]/40 line-clamp-1 mt-0.5">{t.description}</p>
                  <p className="text-xs text-[var(--foreground)]/30 mt-1">Por {t.profiles?.full_name ?? 'Usuario'}</p>
                </div>
                {t.assets && (
                  <div className="shrink-0 flex items-center">
                    <span className="text-xs px-2 py-1 rounded-lg bg-[var(--surface)] text-[var(--foreground)]/50">
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
