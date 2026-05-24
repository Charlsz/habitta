const CATEGORY_LABELS: Record<string, string> = {
  announcement: "📢 Comunicado",
  maintenance:  "🔧 Mantenimiento",
  services:     "💧 Servicios",
  emergency:    "🚨 Emergencia",
};

interface Broadcast {
  id: string;
  message: string;
  category: string;
  recipient_count: number;
  sent_at: string;
}

export function BroadcastHistory({ items }: { items: Broadcast[] }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[var(--muted)] italic">
        No hay broadcasts enviados aún. El historial aparecerá aquí.
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((b) => {
        const date = new Date(b.sent_at).toLocaleDateString("es-CO", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        const preview = b.message.length > 100 ? b.message.slice(0, 100) + "..." : b.message;
        const catLabel = CATEGORY_LABELS[b.category] ?? b.category;

        return (
          <li key={b.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[var(--surface)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#d4a373]/15 flex items-center justify-center text-base shrink-0 mt-0.5">
              {catLabel.split(" ")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#c8935f]">{catLabel}</span>
                <span className="text-xs text-[var(--muted)]">·</span>
                <span className="text-xs text-[var(--muted)]">{date}</span>
              </div>
              <p className="text-sm text-[var(--foreground)] line-clamp-2">{preview}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
                👥 {b.recipient_count}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
