import type { ResidentStatus, ResidentRelationType } from '../domain/resident.types';

const STATUS_STYLES: Record<ResidentStatus, { dot: string; bg: string; text: string; label: string }> = {
  active:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Activo' },
  inactive: { dot: 'bg-gray-400',    bg: 'bg-gray-100 dark:bg-gray-800',         text: 'text-gray-600 dark:text-gray-400',      label: 'Inactivo' },
  pending:  { dot: 'bg-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',    label: 'Pendiente' },
};

const RELATION_LABELS: Record<ResidentRelationType, string> = {
  owner:    'Propietario',
  tenant:   'Arrendatario',
  resident: 'Residente',
  buyer:    'Comprador',
  other:    'Otro',
};

export function ResidentStatusBadge({ status }: { status: ResidentStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function ResidentRelationBadge({ type }: { type: ResidentRelationType }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--sidebar-bg)] text-[var(--muted)] border border-[var(--border)]">
      {RELATION_LABELS[type] ?? type}
    </span>
  );
}
