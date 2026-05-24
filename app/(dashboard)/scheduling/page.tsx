import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getActiveOrganizationId } from "@/modules/organizations/application/org.utils";
import { getEvents } from "@/modules/scheduling/infrastructure/event.repository";
import { EventStatusBadge } from "@/modules/scheduling/presentation/event-badge";
import { changeEventStatusAction } from "@/modules/scheduling/application/event.actions";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ org?: string; status?: string }>;
}

export default async function SchedulingPage({ searchParams }: Props) {
  const params = await searchParams;
  const user   = await requireAuth();
  const orgId  = await getActiveOrganizationId(user.id, params.org);
  const events = await getEvents(orgId);

  const upcoming = events.filter((ev: any) => ev.status !== 'completed' && ev.status !== 'rejected');
  const past      = events.filter((ev: any) => ev.status === 'completed' || ev.status === 'rejected');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Agenda</h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-0.5">Visitas, reservas y mantenimientos programados.</p>
        </div>
        <Link
          href={`/scheduling/new?org=${orgId}`}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#d4a373' }}
        >
          + Programar
        </Link>
      </div>

      {/* Próximas */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]/40 mb-3">
          Próximas — {upcoming.length}
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-10 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm text-[var(--foreground)]/40">No hay actividades pendientes.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden divide-y divide-[var(--border)]">
            {upcoming.map((ev: any) => (
              <EventRow key={ev.id} ev={ev} orgId={orgId} />
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground)]/40 mb-3">
            Historial — {past.length}
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden divide-y divide-[var(--border)] opacity-70">
            {past.map((ev: any) => (
              <EventRow key={ev.id} ev={ev} orgId={orgId} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventRow({ ev, orgId, showActions = true }: { ev: any; orgId: string; showActions?: boolean }) {
  const start = new Date(ev.start_time).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  const end   = new Date(ev.end_time).toLocaleTimeString('es-CO',  { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex gap-4 p-5 items-start hover:bg-[var(--surface)] transition-colors">

      {/* Fecha */}
      <div className="shrink-0 rounded-xl px-3 py-2 text-center min-w-[90px]"
        style={{ backgroundColor: '#d4a37315', color: '#d4a373' }}>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Inicio</p>
        <p className="text-xs font-semibold mt-0.5 leading-tight">{start}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <EventStatusBadge status={ev.status} />
          {ev.assets && (
            <span className="text-xs text-[var(--foreground)]/40 bg-[var(--surface)] px-2 py-0.5 rounded-lg">
              {ev.assets.name}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[var(--foreground)] truncate">{ev.title}</h3>
        <p className="text-sm text-[var(--foreground)]/40 line-clamp-1 mt-0.5">{ev.description}</p>
        <p className="text-xs text-[var(--foreground)]/30 mt-1">
          {ev.profiles?.full_name ?? 'Desconocido'} · hasta {end}
        </p>
      </div>

      {/* Acciones — inline server actions */}
      {showActions && (
        <div className="shrink-0 flex flex-col gap-1.5">
          {ev.status === 'pending' && (
            <>
              <form action={async () => { 'use server'; await changeEventStatusAction(ev.id, 'approved'); }}>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium w-full">
                  Aprobar
                </button>
              </form>
              <form action={async () => { 'use server'; await changeEventStatusAction(ev.id, 'rejected'); }}>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium w-full">
                  Rechazar
                </button>
              </form>
            </>
          )}
          {ev.status === 'approved' && (
            <form action={async () => { 'use server'; await changeEventStatusAction(ev.id, 'completed'); }}>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--foreground)]/60 hover:bg-[var(--border)] transition-colors font-medium">
                Completado
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
