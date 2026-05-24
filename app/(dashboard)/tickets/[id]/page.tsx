import {
  getTicketById,
  getTicketComments,
  getTicketAttachments,
  getOrgMembers,
} from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import { TelegramNotifiedBadge } from "@/modules/tickets/presentation/telegram-notified-badge";
import { SLABadge } from "@/modules/tickets/components/SLABadge";
import {
  changeTicketStatusAction,
  changeTicketPriorityAction,
  addTicketCommentAction,
  respondToTicketAction,
  assignTicketAction,
} from "@/modules/tickets/application/ticket.actions";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getAuditLogs } from "@/modules/audit/infrastructure/audit.repository";
import { AuditHistory } from "@/modules/audit/presentation/audit-history";
import { TelegramReplyForm } from "@/modules/telegram/presentation/telegram-reply-form";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { TicketStatus, TICKET_STATUS_LABELS } from "@/modules/tickets/domain/ticket.schema";
import { SLA_HOURS } from "@/lib/sla";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALL_STATUSES: TicketStatus[] = [
  "open", "in_review", "in_progress", "on_hold", "resolved", "rejected", "closed",
];

const PRIORITIES = [
  { value: "urgent", label: "🔴 Urgente",  sla: "2 horas",  color: "text-red-600" },
  { value: "high",   label: "🟠 Alta",     sla: "24 horas", color: "text-orange-500" },
  { value: "medium", label: "🟡 Media",    sla: "3 días",   color: "text-yellow-600" },
  { value: "low",    label: "🟢 Baja",     sla: "7 días",   color: "text-green-600" },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
  });
}

async function getTelegramSession(sessionId: string) {
  const { data } = await supabaseAdmin
    .from("chat_sessions")
    .select("display_name, telegram_username")
    .eq("id", sessionId)
    .single();
  return data;
}

// ── SLA Section mejorada ──────────────────────────────────────────────────────
function SLAProgressSection({
  priority, createdAt, status, isAdmin, ticketId,
}: {
  priority: string; createdAt: string; status: string;
  isAdmin: boolean; ticketId: string;
}) {
  const isClosed = status === "closed" || status === "resolved";
  const slaHours  = SLA_HOURS[priority] ?? 72;
  const slaTotalMs = slaHours * 3_600_000;
  const elapsed    = Date.now() - new Date(createdAt).getTime();
  const pct        = Math.min(Math.round((elapsed / slaTotalMs) * 100), 100);
  const slaState   = pct < 75 ? "on_track" : pct < 100 ? "at_risk" : "overdue";

  const barColor = slaState === "on_track" ? "bg-green-500" : slaState === "at_risk" ? "bg-yellow-400" : "bg-red-500";
  const dueAt    = new Date(new Date(createdAt).getTime() + slaTotalMs);
  const now      = new Date();
  const diffMs   = dueAt.getTime() - now.getTime();

  // Etiqueta humana de tiempo restante / vencido
  function humanTime(ms: number) {
    const abs = Math.abs(ms);
    const mins = Math.round(abs / 60_000);
    if (mins < 60)   return `${mins} min`;
    const h = Math.floor(mins / 60);
    if (h < 48)      return `${h} hora${h !== 1 ? "s" : ""}`;
    const d = Math.floor(h / 24);
    return `${d} día${d !== 1 ? "s" : ""}`;
  }

  const timeLabel = isClosed
    ? "Ticket cerrado"
    : diffMs > 0
    ? `Quedan ${humanTime(diffMs)} para resolver`
    : `Venció hace ${humanTime(diffMs)}`;

  const stateLabel =
    isClosed    ? { text: "Cerrado",  bg: "bg-gray-100",   color: "text-gray-500" } :
    slaState === "on_track" ? { text: "A tiempo",  bg: "bg-green-50",  color: "text-green-700" } :
    slaState === "at_risk"  ? { text: "En riesgo", bg: "bg-yellow-50", color: "text-yellow-700" } :
                              { text: "Vencido",   bg: "bg-red-50",    color: "text-red-600" };

  // Explicación humana por prioridad
  const prioMeta = PRIORITIES.find(p => p.value === priority);

  return (
    <div className="habitta-card p-5 space-y-4">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-[var(--foreground)]">⏱ Tiempo de resolución</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Este ticket tiene prioridad{" "}
            <span className={`font-semibold ${prioMeta?.color ?? ""}`}>{prioMeta?.label ?? priority}</span>
            {" "}— se espera resolverlo en{" "}
            <span className="font-semibold">{prioMeta?.sla ?? `${slaHours}h`}</span> desde que fue creado.
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${stateLabel.bg} ${stateLabel.color}`}>
          {stateLabel.text}
        </span>
      </div>

      {/* Barra */}
      {!isClosed && (
        <div>
          <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted)] mt-1.5">
            <span>Creado: {new Date(createdAt).toLocaleDateString("es-CO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</span>
            <span className="font-medium">{timeLabel}</span>
            <span>Límite: {dueAt.toLocaleDateString("es-CO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</span>
          </div>
        </div>
      )}

      {/* Selector de prioridad para admin */}
      {isAdmin && (
        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Ajustar prioridad manualmente</p>
          <form
            action={async (fd: FormData) => {
              "use server";
              await changeTicketPriorityAction(ticketId, fd.get("priority") as string);
            }}
            className="flex items-center gap-3"
          >
            <select
              name="priority"
              defaultValue={priority}
              className="flex-1 text-sm border border-[var(--border)] rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label} — resolución en {p.sla}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="shrink-0 bg-[#d4a373] hover:bg-[#c8935f] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Aplicar
            </button>
          </form>
          <p className="text-xs text-[var(--muted)] mt-1.5">
            Al cambiar la prioridad, el SLA se recalcula automáticamente y se deja un comentario en el historial.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicketById(id);
  const { role } = await requireOrgRole(ticket.organization_id, ["owner", "admin", "member"]);

  const [comments, attachments, members, auditLogs] = await Promise.all([
    getTicketComments(id),
    getTicketAttachments(id),
    getOrgMembers(ticket.organization_id),
    getAuditLogs(id, "ticket").catch(() => []),
  ]);

  const isAdmin      = role === "owner" || role === "admin";
  const assigneeName = (ticket as any).assignee?.full_name ?? null;
  const isTelegramTicket = (ticket as any).source === "telegram" && !!(ticket as any).telegram_session_id;
  const telegramNotifiedAt = (ticket as any).telegram_notified_at ?? null;

  const telegramSession = isTelegramTicket && isAdmin
    ? await getTelegramSession((ticket as any).telegram_session_id)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/tickets" className="habitta-link text-sm mb-2 inline-block">
        ← Volver a solicitudes
      </Link>

      {/* ── Header ── */}
      <div className="habitta-card p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <TicketStatusBadge status={ticket.status as TicketStatus} />
              <TicketPriorityBadge priority={ticket.priority as any} />
              {isTelegramTicket && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">📲 Telegram</span>
              )}
              {assigneeName ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#d4a373]/15 text-[#c8935f]">👤 {assigneeName}</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-400">Sin asignar</span>
              )}
              <TelegramNotifiedBadge notifiedAt={telegramNotifiedAt} />
            </div>
            <h1 className="text-2xl font-bold habitta-title">{ticket.title}</h1>
            <p className="text-sm habitta-muted">
              Creado por{" "}
              <span className="font-semibold">
                {isTelegramTicket
                  ? (telegramSession?.display_name ?? "Residente vía Telegram")
                  : ((ticket as any).profiles?.full_name || "Desconocido")}
              </span>{" "}
              • #{ticket.id.split("-")[0]}
            </p>
          </div>

          {isAdmin && (
            <form
              action={async (formData: FormData) => {
                "use server";
                await changeTicketStatusAction(ticket.id, formData.get("status") as TicketStatus);
              }}
              className="flex items-center gap-2"
            >
              <select
                name="status"
                defaultValue={ticket.status}
                className="text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{TICKET_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button type="submit" className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                Guardar
              </button>
            </form>
          )}
        </div>

        <div className="bg-[var(--surface)] text-sm text-[var(--foreground)] p-4 rounded-lg border border-[var(--border)]">
          {ticket.description}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-t border-[var(--border)] pt-4">
          {(ticket as any).assets && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Unidad afectada</p>
              <p className="text-sm font-medium mt-1">{(ticket as any).assets.name}</p>
            </div>
          )}
          {ticket.due_date && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Fecha Límite</p>
              <p className="text-sm font-medium mt-1">{formatDate(ticket.due_date)}</p>
            </div>
          )}
          {ticket.closed_at && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Cerrado el</p>
              <p className="text-sm font-medium mt-1">{formatDate(ticket.closed_at)}</p>
            </div>
          )}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Adjuntos</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {attachments.map((att) => (
                  <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="habitta-link text-sm">
                    📎 {att.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SLA ── */}
      <SLAProgressSection
        priority={ticket.priority}
        createdAt={ticket.created_at}
        status={ticket.status}
        isAdmin={isAdmin}
        ticketId={id}
      />

      {/* ── Responsable ── */}
      {isAdmin && (
        <div className="habitta-card p-5">
          <h3 className="font-semibold text-sm text-[var(--foreground)] uppercase tracking-wide mb-3">👥 Responsable asignado</h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              await assignTicketAction(formData);
            }}
            className="flex items-center gap-3"
          >
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <select
              name="assigned_to"
              defaultValue={ticket.assigned_to ?? ""}
              className="flex-1 text-sm border border-[var(--border)] rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
            >
              <option value="">— Sin asignar</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profiles?.full_name ?? m.user_id} ({m.role})
                </option>
              ))}
            </select>
            <button type="submit" className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0">
              Asignar
            </button>
          </form>
        </div>
      )}

      {/* ── Respuesta administrativa ── */}
      {ticket.response ? (
        <div className="rounded-xl border border-[#d4a373]/40 bg-[#d4a373]/8 p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c8935f]">📨 Respuesta del administrador</p>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{ticket.response}</p>
        </div>
      ) : (
        isAdmin && (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <p className="text-xs habitta-muted italic">Aún no hay respuesta administrativa para esta solicitud.</p>
          </div>
        )
      )}

      {isAdmin && (
        <div className="habitta-card p-5 space-y-3">
          <h3 className="font-semibold text-sm text-[var(--foreground)] uppercase tracking-wide">
            {ticket.response ? "✏️ Editar respuesta administrativa" : "✉️ Agregar respuesta administrativa"}
          </h3>
          <form
            action={async (formData: FormData) => {
              "use server";
              await respondToTicketAction(formData);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <textarea
              name="response"
              rows={4}
              defaultValue={ticket.response ?? ""}
              placeholder="Escribe la respuesta oficial para el residente o solicitante..."
              className="w-full text-sm border border-[var(--border)] p-3 rounded-md outline-none focus:ring-2 focus:ring-[#d4a373] bg-white resize-none"
            />
            <button type="submit" className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors">
              Guardar respuesta
            </button>
          </form>
        </div>
      )}

      {/* ── Telegram reply ── */}
      {isAdmin && isTelegramTicket && telegramSession && (
        <TelegramReplyForm
          ticketId={ticket.id}
          residentName={telegramSession.display_name ?? "Residente"}
          residentUsername={telegramSession.telegram_username}
        />
      )}

      {/* ── Actualizaciones ── */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg habitta-title">Actualizaciones</h3>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm habitta-muted italic">No hay actualizaciones aún.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="habitta-card p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4a373]/20 flex items-center justify-center text-[#d4a373] font-bold flex-shrink-0 text-sm">
                  {c.profiles?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.profiles?.full_name}</p>
                  <p className="text-sm habitta-muted mt-1 whitespace-pre-wrap">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <form
          action={async (formData) => {
            "use server";
            await addTicketCommentAction(formData);
          }}
          className="mt-6 habitta-card p-4 flex flex-col items-end"
        >
          <input type="hidden" name="ticket_id" value={ticket.id} />
          <textarea
            name="message"
            required
            rows={3}
            placeholder="Escribe una actualización o respuesta..."
            className="w-full text-sm border border-[var(--border)] p-3 rounded-md outline-none focus:ring-2 focus:ring-[#d4a373] bg-white resize-none"
          />
          <button type="submit" className="mt-3 bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md font-medium text-sm hover:opacity-80 transition-opacity">
            Enviar respuesta
          </button>
        </form>
      </div>

      {/* ── Historial ── */}
      <AuditHistory logs={auditLogs} />
    </div>
  );
}
