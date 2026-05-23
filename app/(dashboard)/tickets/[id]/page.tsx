import { 
  getTicketById, 
  getTicketComments, 
  getTicketAttachments 
} from "@/modules/tickets/infrastructure/ticket.repository";
import { TicketPriorityBadge, TicketStatusBadge } from "@/modules/tickets/presentation/ticket-badge";
import { changeTicketStatusAction, addTicketCommentAction } from "@/modules/tickets/application/ticket.actions";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import Link from "next/link";
import { TicketStatus } from "@/modules/tickets/domain/ticket.schema";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicketById(params.id);
  await requireOrgRole(ticket.organization_id, ["owner", "admin", "member"]);
  const comments = await getTicketComments(params.id);
  const attachments = await getTicketAttachments(params.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/tickets" className="text-blue-600 text-sm mb-2 inline-block hover:underline">
        ← Volver a tickets
      </Link>
      
      {/* Header del Ticket */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
             <div className="flex gap-2">
               <TicketStatusBadge status={ticket.status as TicketStatus} />
               <TicketPriorityBadge priority={ticket.priority as any} />
             </div>
             <h1 className="text-2xl font-bold">{ticket.title}</h1>
             <p className="text-sm text-gray-500">
               Creado por <span className="font-semibold">{ticket.profiles.full_name || 'Desconocido'}</span> • UUID: {ticket.id.split("-")[0]}
             </p>
          </div>

          {/* Selector para cambiar de estado rápidadamente (Server Action directo) */}
          <form action={async (formData: FormData) => {
            "use server";
            await changeTicketStatusAction(ticket.id, formData.get("status") as TicketStatus);
          }}>
            <select 
              name="status" 
              defaultValue={ticket.status}
              className="text-sm border-gray-300 rounded-md border p-1"
            >
              <option value="open">Cambiar a: Abierto</option>
              <option value="in_progress">Cambiar a: En Progreso</option>
              <option value="resolved">Cambiar a: Resuelto</option>
              <option value="closed">Cambiar a: Cerrado</option>
            </select>
            <button type="submit" className="ml-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">Guardar</button>
          </form>
        </div>

        <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded text-sm">
          {ticket.description}
        </div>

        {/* Metadatos y Adjuntos */}
        <div className="mt-6 flex flex-wrap gap-6 border-t pt-4">
          {ticket.assets && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Activo Afectado</p>
              <p className="text-sm font-medium mt-1">{ticket.assets.name}</p>
            </div>
          )}
          {attachments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Adjuntos</p>
              <div className="flex gap-2 mt-1">
                {attachments.map(att => (
                   <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      📎 {att.file_name}
                   </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hilo de Respuestas (Respuestas Administrativas) */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Actualizaciones</h3>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay actualizaciones aún. Sé el primero en responder.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-lg border flex gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                  {c.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                   <p className="text-sm font-semibold">{c.profiles?.full_name}</p>
                   <p className="text-sm text-gray-700 mt-1">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de respuesta administrativa */}
        <form action={async (formData) => {
          "use server";
          await addTicketCommentAction(formData);
        }} className="mt-6 bg-white p-4 rounded-xl border shadow-sm flex flex-col items-end">
           <input type="hidden" name="ticket_id" value={ticket.id} />
           <textarea 
             name="message" 
             required
             rows={3} 
             placeholder="Escribe una actualización o respuesta..." 
             className="w-full text-sm border p-3 rounded-md outline-none focus:ring-blue-500"
           />
           <button type="submit" className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800">
             Enviar Respuesta
           </button>
        </form>
      </div>
    </div>
  );
}
