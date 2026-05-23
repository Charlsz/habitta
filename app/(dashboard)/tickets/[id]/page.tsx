import {
  getTicketById,
  getTicketComments,
  getTicketAttachments,
} from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import { changeTicketStatusAction, addTicketCommentAction } from "@/modules/tickets/application/ticket.actions";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import Link from "next/link";
import {
  TicketStatus,
  TICKET_STATUS_LABELS,
} from "@/modules/tickets/domain/ticket.schema";

const ALL_STATUSES: TicketStatus[] = [
  "open",
  "in_review",
  "in_progress",
  "on_hold",
  "resolved",
  "rejected",
  "closed",
];

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicketById(params.id);
  await requireOrgRole(ticket.organization_id, ["owner", "admin", "member"]);
  const comments    = await getTicketComments(params.id);
  const attachments = await getTicketAttachments(params.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/tickets" className="habitta-link text-sm mb-2 inline-block">
        ← Volver a tickets
      </Link>

      {/* Header del Ticket */}
      <div className="habitta-card p-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <TicketStatusBadge status={ticket.status as TicketStatus} />
              <TicketPriorityBadge priority={ticket.priority as any} />
            </div>
            <h1 className="text-2xl font-bold habitta-title">{ticket.title}</h1>
            <p className="text-sm habitta-muted">
              Creado por{" "}
              <span className="font-semibold">
                {ticket.profiles.full_name || "Desconocido"}
              </span>{" "}
              • #{ticket.id.split("-")[0]}
            </p>
          </div>

          {/* Selector de estado — 7 opciones */}
          <form
            action={async (formData: FormData) => {
              "use server";
              await changeTicketStatusAction(
                ticket.id,
                formData.get("status") as TicketStatus
              );
            }}
            className="flex items-center gap-2"
          >
            <select
              name="status"
              defaultValue={ticket.status}
              className="text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              Guardar
            </button>
          </form>
        </div>

        <div className="bg-[var(--surface)] text-sm text-[var(--foreground)] p-4 rounded-lg border border-[var(--border)]">
          {ticket.description}
        </div>

        {/* Metadatos y Adjuntos */}
        <div className="mt-6 flex flex-wrap gap-6 border-t border-[var(--border)] pt-4">
          {ticket.assets && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Activo Afectado</p>
              <p className="text-sm font-medium mt-1">{ticket.assets.name}</p>
            </div>
          )}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Adjuntos</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="habitta-link text-sm"
                  >
                    📎 {att.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hilo de comentarios */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg habitta-title">Actualizaciones</h3>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm habitta-muted italic">
              No hay actualizaciones aún. Sé el primero en responder.
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="habitta-card p-4 flex gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#d4a373]/20 flex items-center justify-center text-[#d4a373] font-bold flex-shrink-0 text-sm">
                  {c.profiles?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.profiles?.full_name}</p>
                  <p className="text-sm habitta-muted mt-1">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de respuesta */}
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
          <button
            type="submit"
            className="mt-3 bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md font-medium text-sm hover:opacity-80 transition-opacity"
          >
            Enviar Respuesta
          </button>
        </form>
      </div>
    </div>
  );
}
