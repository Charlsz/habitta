import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { getClientById } from '@/modules/clients/infrastructure/client.repository';
import { ClientStatusBadge, ClientRelationBadge } from '@/modules/clients/components/ClientBadge';
import { createClient as createSupabase } from '@/lib/supabase/server';

interface Props {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ org?: string }>;
}

const TICKET_STATUS_STYLES: Record<string, string> = {
  open:        'bg-blue-100 text-blue-700',
  in_review:   'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-purple-100 text-purple-700',
  on_hold:     'bg-yellow-100 text-yellow-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
  rejected:    'bg-red-100 text-red-700',
};

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const user        = await requireAuth();
  const { id }      = await params;
  const { org }     = await searchParams;
  const orgId       = await getActiveOrganizationId(user.id, org);
  const supabase    = await createSupabase();

  const [client, { data: tickets }, { data: events }] = await Promise.all([
    getClientById(id),
    supabase
      .from('tickets')
      .select('id, title, status, priority, type, created_at')
      .eq('resident_id', id)
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('events')
      .select('id, title, start_time, status')
      .eq('resident_id', id)
      .order('start_time', { ascending: false })
      .limit(10),
  ]);

  if (!client) notFound();

  const asset = client.assets as any;
  const chat  = client.chat_sessions as any;

  const location = [
    client.metadata?.tower && `Torre ${client.metadata.tower}`,
    client.metadata?.floor && `Piso ${client.metadata.floor}`,
    client.metadata?.unit  && `Apto ${client.metadata.unit}`,
  ].filter(Boolean).join(' · ');

  const initials = client.full_name.trim().split(/\s+/).slice(0,2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)]">
        <Link href={`/clients?org=${orgId}`} className="hover:text-[#d4a373]">Clientes</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{client.full_name}</span>
      </nav>

      {/* Ficha principal */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ backgroundColor: '#d4a373' }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-[var(--foreground)]">{client.full_name}</h1>
              <ClientStatusBadge status={client.status} />
              <ClientRelationBadge type={client.relation_type} />
              {chat?.telegram_chat_id && (
                <span title="Conectado a Telegram" className="text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5">✈ Telegram</span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              {client.email && <a href={`mailto:${client.email}`} className="hover:text-[#d4a373]">✉ {client.email}</a>}
              {client.phone && <a href={`tel:${client.phone}`}    className="hover:text-[#d4a373]">📞 {client.phone}</a>}
              {client.move_in_date && (
                <span>📅 Desde {new Date(client.move_in_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
            </div>

            {client.document_number && (
              <p className="mt-1 text-xs text-[var(--muted)]">
                {client.document_type?.toUpperCase()} · {client.document_number}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/clients/${id}/edit?org=${orgId}`}
              className="px-3 py-1.5 rounded-lg text-sm border border-[var(--border)] hover:border-[#d4a373] transition-colors"
            >
              Editar
            </Link>
            <Link
              href={`/tickets/new?resident_id=${id}&org=${orgId}`}
              className="px-3 py-1.5 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#d4a373' }}
            >
              + Ticket
            </Link>
          </div>
        </div>

        {/* Unidad asignada */}
        {asset && (
          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <Link
              href={`/assets/${client.asset_id}?org=${orgId}`}
              className="flex items-center gap-3 group w-fit"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[#d4a373] transition-colors">
                  {asset.name}{asset.code ? ` · ${asset.code}` : ''}
                </p>
                {location && <p className="text-xs text-[var(--muted)]">{location}</p>}
              </div>
              <span className="text-[var(--muted)] group-hover:text-[#d4a373] ml-1">→</span>
            </Link>
          </div>
        )}

        {/* Notas */}
        {client.notes && (
          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted)] mb-1">Notas internas</p>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Tickets */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--foreground)]">Tickets <span className="text-[var(--muted)] font-normal text-sm">({tickets?.length ?? 0})</span></h2>
          <Link href={`/tickets/new?resident_id=${id}&org=${orgId}`} className="text-xs text-[#d4a373] hover:underline">+ Nuevo ticket</Link>
        </div>
        {!tickets?.length ? (
          <p className="text-sm text-[var(--muted)]">Sin tickets registrados.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((t: any) => (
              <Link key={t.id} href={`/tickets/${t.id}?org=${orgId}`}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[#d4a373]/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{t.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {t.type} · {new Date(t.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TICKET_STATUS_STYLES[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Eventos / Visitas */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--foreground)]">Visitas agendadas <span className="text-[var(--muted)] font-normal text-sm">({events?.length ?? 0})</span></h2>
          <Link href={`/scheduling?resident_id=${id}&org=${orgId}`} className="text-xs text-[#d4a373] hover:underline">Ver agenda</Link>
        </div>
        {!events?.length ? (
          <p className="text-sm text-[var(--muted)]">Sin visitas registradas.</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{ev.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {new Date(ev.start_time).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TICKET_STATUS_STYLES[ev.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
