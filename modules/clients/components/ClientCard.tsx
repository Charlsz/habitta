import Link from 'next/link';
import type { ClientWithStats } from '../domain/client.types';
import { ClientStatusBadge, ClientRelationBadge } from './ClientBadge';

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: '#d4a373' }}>
      {initials}
    </div>
  );
}

interface Props {
  client: ClientWithStats;
  orgId:  string;
}

export function ClientCard({ client, orgId }: Props) {
  const location = [
    client.metadata?.tower && `Torre ${client.metadata.tower}`,
    client.metadata?.floor && `Piso ${client.metadata.floor}`,
    client.metadata?.unit  && `Apto ${client.metadata.unit}`,
  ].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/clients/${client.id}?org=${orgId}`}
      className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[#d4a373]/60 hover:shadow-md transition-all duration-150"
    >
      <Avatar name={client.full_name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--foreground)] truncate group-hover:text-[#d4a373] transition-colors">
            {client.full_name}
          </p>
          <ClientStatusBadge status={client.status} />
          <ClientRelationBadge type={client.relation_type} />
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--muted)] flex-wrap">
          {client.asset_name && (
            <span className="flex items-center gap-1">
              🏠 {client.asset_name}{client.asset_code ? ` (${client.asset_code})` : ''}
            </span>
          )}
          {location && <span>{location}</span>}
          {client.email && <span className="hidden md:inline">✉ {client.email}</span>}
          {client.phone && <span>📞 {client.phone}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {client.telegram_chat_id && (
          <span title="Conectado a Telegram" className="text-blue-500 text-sm">✈</span>
        )}
        {client.open_tickets > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {client.open_tickets} ticket{client.open_tickets !== 1 ? 's' : ''}
          </span>
        )}
        {client.last_ticket_at && (
          <span className="text-xs text-[var(--muted)]">
            {new Date(client.last_ticket_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  );
}
