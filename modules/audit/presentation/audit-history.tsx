import type { AuditLog, AuditAction } from "../infrastructure/audit.repository";

const ACTION_META: Record<
  AuditAction,
  { icon: string; label: (log: AuditLog) => string; color: string }
> = {
  created: {
    icon: "✨",
    color: "bg-green-100 text-green-700",
    label: () => "Ticket creado",
  },
  updated: {
    icon: "✏️",
    color: "bg-blue-100 text-blue-700",
    label: () => "Ticket actualizado",
  },
  status_changed: {
    icon: "🔄",
    color: "bg-yellow-100 text-yellow-700",
    label: (log) => {
      const from = STATUS_ES[(log.old_value?.status as string) ?? ""] ?? log.old_value?.status;
      const to   = STATUS_ES[(log.new_value?.status as string) ?? ""] ?? log.new_value?.status;
      if (from && to)  return `Estado cambiado: ${from} → ${to}`;
      if (to)          return `Estado cambiado a: ${to}`;
      return "Estado actualizado";
    },
  },
  assigned: {
    icon: "👤",
    color: "bg-purple-100 text-purple-700",
    label: (log) =>
      log.new_value?.assigned_to ? "Responsable asignado" : "Responsable removido",
  },
  commented: {
    icon: "💬",
    color: "bg-[#d4a373]/15 text-[#c8935f]",
    label: () => "Comentario agregado",
  },
  responded: {
    icon: "📬",
    color: "bg-indigo-100 text-indigo-700",
    label: () => "Respuesta administrativa guardada",
  },
  deleted: {
    icon: "🗑️",
    color: "bg-red-100 text-red-700",
    label: () => "Eliminado",
  },
};

const STATUS_ES: Record<string, string> = {
  open:        "Abierto",
  in_review:   "En revisión",
  in_progress: "En progreso",
  on_hold:     "En espera",
  resolved:    "Resuelto",
  rejected:    "Rechazado",
  closed:      "Cerrado",
};

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return "justo ahora";
  if (mins  <  60) return `hace ${mins} minuto${mins  !== 1 ? "s" : ""}`;
  if (hours <  24) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (days  <  30) return `hace ${days} día${days  !== 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  logs: AuditLog[];
}

export function AuditHistory({ logs }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg habitta-title">Historial</h3>

      {logs.length === 0 ? (
        <div className="habitta-card p-5 text-center text-sm habitta-muted italic">
          No hay registros de actividad para este ticket.
        </div>
      ) : (
        <ol className="relative border-l border-[var(--border)] ml-3 space-y-0">
          {logs.map((log) => {
            const action     = log.action as AuditAction;
            const meta       = ACTION_META[action] ?? ACTION_META.updated;
            const label      = meta.label(log);
            const who        = log.profiles?.full_name ?? "Sistema";
            // Extraer valores como string — evita unknown en JSX
            const oldStatus  = String(log.old_value?.status ?? "");
            const newStatus  = String(log.new_value?.status ?? "");
            const previewMsg = String(log.new_value?.message ?? log.new_value?.response ?? "");
            const showStatus = action === "status_changed" && oldStatus.length > 0 && newStatus.length > 0;
            const showPreview = (action === "commented" || action === "responded") && previewMsg.length > 0;

            return (
              <li key={log.id} className="ml-5 pb-5">
                <span
                  className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full text-[11px] ring-2 ring-white ${meta.color}`}
                >
                  {meta.icon}
                </span>

                <div className="habitta-card p-3.5 ml-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
                    <time className="text-xs text-[var(--muted)] shrink-0">
                      {relativeTime(log.created_at)}
                    </time>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Por <span className="font-medium text-[var(--foreground)]">{who}</span>
                  </p>

                  {showStatus && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                        {STATUS_ES[oldStatus] ?? oldStatus}
                      </span>
                      <span className="text-xs text-[var(--muted)]">→</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                        {STATUS_ES[newStatus] ?? newStatus}
                      </span>
                    </div>
                  )}

                  {showPreview && (
                    <p className="mt-2 text-xs text-[var(--muted)] italic line-clamp-2">
                      “{previewMsg}”
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
