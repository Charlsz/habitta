import Link from 'next/link';
import { requireOrgRole } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getClients } from '@/modules/clients/infrastructure/client.repository';
import { getAssetsByOrganization } from '@/modules/assets/infrastructure/asset.repository';
import { ClientCard } from '@/modules/clients/components/ClientCard';
import { TelegramLinkButton } from '@/modules/telegram/presentation/telegram-link-button';
import { AssetManager } from '@/modules/assets/presentation/AssetManager';
import { createClient as createSupabase } from '@/lib/supabase/server';
import type { ClientStatus } from '@/modules/clients/domain/client.types';

interface Props {
  searchParams: Promise<{ org?: string; status?: string; q?: string }>;
}

export default async function ClientsPage({ searchParams }: Props) {
  const user   = await requireAuth();
  const params = await searchParams;
  const orgId  = await getActiveOrganizationId(user.id, params.org);

  const { role } = await requireOrgRole(orgId, ['owner', 'admin', 'member']);
  const isAdmin = role === 'owner' || role === 'admin';

  const supabase = await createSupabase();
  const { data: orgData } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .maybeSingle();
  const orgName = orgData?.name ?? '';

  const [all, assets] = await Promise.all([
    getClients(orgId),
    getAssetsByOrganization(orgId),
  ]);

  const q      = params.q?.toLowerCase().trim() ?? '';
  const status = params.status as ClientStatus | undefined;

  const filtered = all.filter(c => {
    const matchQ = !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.asset_name?.toLowerCase().includes(q) ||
      String(c.metadata?.unit ?? '').toLowerCase().includes(q) ||
      String(c.metadata?.tower ?? '').toLowerCase().includes(q);
    const matchStatus = !status || c.status === status;
    return matchQ && matchStatus;
  });

  const counts = {
    total:    all.length,
    active:   all.filter(c => c.status === 'active').length,
    pending:  all.filter(c => c.status === 'pending').length,
    inactive: all.filter(c => c.status === 'inactive').length,
    withBot:  all.filter(c => c.telegram_chat_id).length,
  };

  const buildHref = (s?: string) => {
    const p = new URLSearchParams({ org: orgId });
    if (s) p.set('status', s);
    if (q) p.set('q', q);
    return `/clients?${p}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Clientes</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {counts.total} {counts.total === 1 ? 'cliente' : 'clientes'}
            {counts.withBot > 0 && ` · ${counts.withBot} en Telegram`}
          </p>
        </div>
        <Link
          href={`/clients/new?org=${orgId}`}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#d4a373' }}
        >
          + Nuevo cliente
        </Link>
      </div>

      {/* Bot link */}
      <TelegramLinkButton organizationId={orgId} organizationName={orgName} />

      {/* ── ACTIVOS / UNIDADES ─────────────────────────────────────────── */}
      {/*
        ¿Qué es un "activo"?
        En Habitta, un activo es cualquier espacio físico que pertenece
        a tu propiedad: un apartamento, un parqueadero, una bodega, un local
        comercial o un área común. Piénsalo como la "ficha" de cada inmueble.
        Una vez creado el activo, puedes:
          · Asignarlo a un cliente (quién vive o usa ese espacio)
          · Vincularlo a tickets (si hay un daño o solicitud en ese lugar)
          · Usarlo en citas de mantenimiento
      */}
      <section className="habitta-card p-5 space-y-1">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            🏢 ¿Qué es una unidad / activo?
          </p>
          <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
            Un <strong>activo</strong> representa cualquier espacio físico de tu propiedad:{' '}
            apartamento, parqueadero, bodega, local, etc.
            Al registrarlo aquí puedes asignarlo a un cliente, adjuntarlo a tickets de soporte
            y programar citas de mantenimiento para ese lugar.
          </p>
        </div>
        <AssetManager
          organizationId={orgId}
          initialAssets={assets.map(a => ({
            id:          a.id,
            name:        a.name,
            code:        a.code ?? null,
            asset_type:  a.asset_type,
            location:    a.location ?? null,
            description: a.description ?? null,
            status:      a.status,
          }))}
        />
      </section>

      {/* ── CLIENTES ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        {/* KPI chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',      value: counts.total,   color: 'var(--foreground)' },
            { label: 'Activos',    value: counts.active,  color: '#10b981' },
            { label: 'Pendientes', value: counts.pending, color: '#f59e0b' },
            { label: 'Telegram',   value: counts.withBot, color: '#3b82f6' },
          ].map(k => (
            <div key={k.label} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros de estado */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Todos',      value: undefined,  count: counts.total    },
            { label: 'Activos',    value: 'active',   count: counts.active   },
            { label: 'Pendientes', value: 'pending',  count: counts.pending  },
            { label: 'Inactivos',  value: 'inactive', count: counts.inactive },
          ].map(chip => {
            const isActive = (status ?? undefined) === chip.value;
            return (
              <Link
                key={chip.label}
                href={buildHref(chip.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? 'border-[#d4a373] bg-[#d4a373]/10 text-[#d4a373]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:border-[#d4a373]/40'
                }`}
              >
                {chip.label} <span className="opacity-60">({chip.count})</span>
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
            placeholder="Buscar por nombre, correo, teléfono, torre o unidad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">🔍</span>
        </form>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-5xl">👥</p>
            <p className="font-medium text-[var(--foreground)]">
              {q || status ? 'Sin resultados para esos filtros' : 'No hay clientes aún'}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {!q && !status && 'Crea el primer cliente de esta organización.'}
            </p>
            {!q && !status && (
              <Link
                href={`/clients/new?org=${orgId}`}
                className="inline-block mt-2 px-5 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: '#d4a373' }}
              >
                Crear primer cliente
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <ClientCard key={c.id} client={c} orgId={orgId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
