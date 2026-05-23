import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getEvents } from "@/modules/scheduling/infrastructure/event.repository";
import { EventStatusBadge } from "@/modules/scheduling/presentation/event-badge";
import { changeEventStatusAction } from "@/modules/scheduling/application/event.actions";
import Link from "next/link";
import { EventStatus } from "@/modules/scheduling/domain/event.schema";

export default async function SchedulingPage() {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);
  
  // Tomamos default org para simplificar, idealmente viene de select o params
  const currentOrg = orgs[0]; 
  const events = currentOrg ? await getEvents(currentOrg.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Operativa</h1>
          <p className="text-gray-500 text-sm mt-1">
            Reservas y programación de mantenimientos para <strong className="text-gray-800">{currentOrg?.name || '...'}</strong>
          </p>
        </div>
        <Link 
          href="/scheduling/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm whitespace-nowrap"
        >
          + Programar Actividad
        </Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay eventos agendados en esta organización.
          </div>
        ) : (
          <div className="divide-y max-h-[70vh] overflow-y-auto">
            {events.map((ev: any) => {
              const start = new Date(ev.start_time).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
              const end = new Date(ev.end_time).toLocaleString('es-ES', { timeStyle: 'short' });
              
              return (
                <div key={ev.id} className="p-5 flex flex-col md:flex-row gap-4 md:items-center hover:bg-gray-50">
                  {/* Fecha Box */}
                  <div className="flex-shrink-0 bg-blue-50 text-blue-800 rounded-md p-3 text-center min-w-[120px]">
                    <div className="text-xs font-bold uppercase">Inicio</div>
                    <div className="font-semibold text-sm mt-1">{start}</div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <EventStatusBadge status={ev.status} />
                      {ev.assets && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Activo: {ev.assets.name}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900">{ev.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{ev.description}</p>
                    <p className="text-xs mt-2 text-gray-400">Solicitado por: {ev.profiles?.full_name || 'Desconocido'} • Fin: {end}</p>
                  </div>

                  {/* Acciones de Aprobación */}
                  <div className="flex flex-row md:flex-col gap-2">
                    {ev.status === 'pending' && (
                      <>
                        <form action={async () => { "use server"; await changeEventStatusAction(ev.id, "approved"); }}>
                          <button className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded font-medium w-full">Aprobar</button>
                        </form>
                        <form action={async () => { "use server"; await changeEventStatusAction(ev.id, "rejected"); }}>
                          <button className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded font-medium w-full">Rechazar</button>
                        </form>
                      </>
                    )}
                    {ev.status === 'approved' && (
                      <form action={async () => { "use server"; await changeEventStatusAction(ev.id, "completed"); }}>
                        <button className="text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1.5 rounded font-medium w-full">Marcar Completado</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}