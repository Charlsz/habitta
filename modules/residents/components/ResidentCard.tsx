import Link from 'next/link';
import type { ResidentWithStats } from '../domain/resident.types';
import { ResidentStatusBadge, ResidentRelationBadge } from './ResidentBadge';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
      style={{ backgroundColor: '#d4a373' }}>
      {initials}
    </div>
  );
}

interface Props {
  resident: ResidentWithStats;
  orgId: string;
}

export function ResidentCard({ resident, orgId }: Props) {
  return (
    <Link
      href={`/residents/${resident.id}?org=${orgId}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[#d4a373]/60 hover:shadow-sm transition-all group"
    >
      <Avatar name={resident.full_name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--foreground)] truncate group-hover:text-[#d4a373] transition-colors">
            {resident.full_name}
          </p>
          <ResidentStatusBadge status={resident.status} />
          <ResidentRelationBadge type={resident.relation_type} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)] flex-wrap">
          {resident.asset_name && (
            <span>🏠 {resident.asset_name}{resident.asset_code ? ` (${resident.asset_code})` : ''}</span>
          )}
          {resident.metadata?.tower && <span>Torre {resident.metadata.tower}</span>}
          {resident.metadata?.floor  && <span>Piso {resident.metadata.floor}</span>}
          {resident.email && <span className="hidden sm:inline">✉ {resident.email}</span>}
          {resident.phone && <span>📞 {resident.phone}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {resident.telegram_chat_id && (
          <span title="Conectado a Telegram" className="text-blue-500 text-sm">✈</span>
        )}
        {resident.open_tickets > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {resident.open_tickets} ticket{resident.open_tickets > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  );
}
