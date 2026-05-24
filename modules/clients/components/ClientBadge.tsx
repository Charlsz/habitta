import type { ClientStatus, ClientRelationType } from '../domain/client.types';

const STATUS_MAP: Record<ClientStatus, { dot: string; bg: string; text: string; label: string }> = {
  active:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Activo' },
  inactive: { dot: 'bg-gray-400',    bg: 'bg-gray-100 dark:bg-gray-800',         text: 'text-gray-500 dark:text-gray-400',      label: 'Inactivo' },
  pending:  { dot: 'bg-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',    label: 'Pendiente' },
};

const RELATION_MAP: Record<ClientRelationType, string> = {
  owner:    'Propietario',
  tenant:   'Arrendatario',
  resident: 'Residente',
  buyer:    'Comprador',
  other:    'Otro',
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function ClientRelationBadge({ type }: { type: ClientRelationType }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--sidebar-bg)] text-[var(--muted)] border border-[var(--border)]">
      {RELATION_MAP[type] ?? type}
    </span>
  );
}
