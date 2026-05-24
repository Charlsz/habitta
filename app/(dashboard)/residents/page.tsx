import { Suspense } from 'react';
import Link from 'next/link';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { getResidents } from '@/modules/residents/infrastructure/resident.repository';
import { ResidentCard } from '@/modules/residents/components/ResidentCard';
import type { ResidentStatus } from '@/modules/residents/domain/resident.types';

interface Props {
  searchParams: Promise<{ org?: string; status?: string; q?: string }>;
}

export default async function ResidentsPage({ searchParams }: Props) {
  const user = await requireAuth();
  const params = await searchParams;
  const orgId = await getActiveOrganizationId(user.id, params.org);

  const all = await getResidents(orgId);

  // Filtros client-safe (server-side filtering)
  const q      = params.q?.toLowerCase() ?? '';
  const status = params.status as ResidentStatus | undefined;

  const filtered = all.filter(r => {
    const matchQ = !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.asset_name?.toLowerCase().includes(q);
    const matchStatus = !status || r.status === status;
    return matchQ && matchStatus;
  });

  const counts = {
    total:    all.length,
    active:   all.filter(r => r.status === 'active').length,
    inactive: all.filter(r => r.status === 'inactive').length,
    pending:  all.filter(r => r.status === 'pending').length,
    withBot:  all.filter(r => r.telegram_chat_id).length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Residentes</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {counts.total} {counts.total === 1 ? 'residente registrado' : 'residentes registrados'} · {counts.withBot} en Telegram
          </p>
        </div>
        <Link
          href={`/residents/new?org=${orgId}`}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: '#d4a373' }}
        >
          + Nuevo residente
        </Link>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Todos', value: undefined, count: counts.total },
          { label: 'Activos', value: 'active', count: counts.active },
          { label: 'Pendientes', value: 'pending', count: counts.pending },
          { label: 'Inactivos', value: 'inactive', count: counts.inactive },
        ].map(chip => {
          const active = (status ?? undefined) === chip.value;
          const href = chip.value
            ? `/residents?org=${orgId}&status=${chip.value}${q ? `&q=${q}` : ''}`
            : `/residents?org=${orgId}${q ? `&q=${q}` : ''}`;
          return (
            <Link
              key={chip.label}
              href={href}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'border-[#d4a373] bg-[#d4a373]/10 text-[#d4a373]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[#d4a373]/50'
              }`}
            >
              {chip.label} <span className="opacity-70">({chip.count})</span>
            </Link>
          );
        })}
      </div>

      {/* Buscador */}
      <form method="GET" className="relative">
        <input type="hidden" name="org" value={orgId} />
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, correo, teléfono o unidad..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">🔍</span>
      </form>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-5xl">👥</p>
          <p className="text-[var(--foreground)] font-medium">No se encontraron residentes</p>
          <p className="text-sm text-[var(--muted)]">
            {q || status ? 'Intenta con otros filtros.' : 'Crea el primer residente para esta organización.'}
          </p>
          {!q && !status && (
            <Link href={`/residents/new?org=${orgId}`} className="inline-block mt-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#d4a373' }}>
              Crear primer residente
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => <ResidentCard key={r.id} resident={r} orgId={orgId} />)}
        </div>
      )}
    </div>
  );
}
