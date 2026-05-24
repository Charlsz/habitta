import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { getResidentById } from '@/modules/residents/infrastructure/resident.repository';
import { ResidentStatusBadge, ResidentRelationBadge } from '@/modules/residents/components/ResidentBadge';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ org?: string }>;
}

export default async function ResidentDetailPage({ params, searchParams }: Props) {
  await requireAuth();
  const { id } = await params;
  const { org } = await searchParams;
  const supabase = await createClient();

  const [resident, { data: tickets }, { data: events }] = await Promise.all([
    getResidentById(id),
    supabase
      .from('tickets')
      .select('id, title, status, priority, created_at, type')
      .eq('resident_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('events')
      .select('id, title, start_time, status')
      .eq('resident_id', id)
      .order('start_time', { ascending: false })
      .limit(10),
  ]);

  if (!resident) notFound();

  const asset = resident.assets as any;
  const chat  = resident.chat_sessions as any;
  const orgId = org ?? resident.organization_id;

  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500',
    on_hold: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)]">
        <Link href={`/residents?org=${orgId}`} className="hover:text-[#d4a373]">Residentes</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{resident.full_name}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: '#d4a373' }}>
            {resident.full_name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-[var(--foreground)]">{resident.full_name}</h1>
              <ResidentStatusBadge status={resident.status} />
              <ResidentRelationBadge type={resident.relation_type} />
              {chat?.telegram_chat_id && <span title="Conectado a Telegram" className="text-blue-500">✈ Telegram</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              {resident.email && <span>✉ {resident.email}</span>}
              {resident.phone && <span>📞 {resident.phone}</span>}
              {resident.move_in_date && <span>📅 Desde {new Date(resident.move_in_date).toLocaleDateString('es-CO')}</span>}
            </div>
          </div>
          <Link
            href={`/residents/${id}/edit?org=${orgId}`}
            className="px-3 py-1.5 rounded-lg text-sm border border-[var(--border)] hover:border-[#d4a373] transition-colors"
          >
            Editar
          </Link>
        </div>

        {/* Unidad */}
        {asset && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{asset.name}{asset.code ? ` · ${asset.code}` : ''}</p>
              <p className="text-xs text-[var(--muted)]">
                {[resident.metadata?.tower && `Torre ${resident.metadata.tower}`,
                  resident.metadata?.floor  && `Piso ${resident.metadata.floor}`,
                  resident.metadata?.unit   && `Apto ${resident.metadata.unit}`].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {/* Documento */}
        {resident.document_number && (
          <div className="mt-3 text-xs text-[var(--muted)]">
            {resident.document_type?.toUpperCase()} {resident.document_number}
          </div>
        )}

        {resident.notes && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] font-medium mb-1">Notas internas</p>
            <p className="text-sm text-[var(--foreground)]">{resident.notes}</p>
          </div>
        )}
      </div>

      {/* Tickets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)]">Tickets ({tickets?.length ?? 0})</h2>
          <Link href={`/tickets/new?resident_id=${id}&org=${orgId}`} className="text-xs text-[#d4a373] hover:underline">+ Crear ticket</Link>
        </div>
        {!tickets?.length ? (
          <p className="text-sm text-[var(--muted)]">Sin tickets registrados.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map(t => (
              <Link key={t.id} href={`/tickets/${t.id}?org=${orgId}`}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] hover:border-[#d4a373]/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{t.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{t.type} · {new Date(t.created_at).toLocaleDateString('es-CO')}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {t.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Eventos / Visitas */}
      <section>
        <h2 className="font-semibold text-[var(--foreground)] mb-3">Visitas agendadas ({events?.length ?? 0})</h2>
        {!events?.length ? (
          <p className="text-sm text-[var(--muted)]">Sin visitas registradas.</p>
        ) : (
          <div className="space-y-2">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{ev.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {new Date(ev.start_time).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted)] capitalize">{ev.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
