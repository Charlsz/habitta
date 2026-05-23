import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { EventForm } from "@/modules/scheduling/presentation/event-form";
import Link from "next/link";

export default async function NewEventPage() {
  const user = await requireAuth();
  const organizations = await getOrganizations(user.id);
  
  let allAssets: any[] = [];
  for (const org of organizations) {
    const assets = await getAssetsByOrganization(org.id);
    allAssets = [...allAssets, ...assets];
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/scheduling" className="text-blue-600 text-sm mb-4 inline-block hover:underline">
          ← Volver a la agenda
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Programar Actividad</h1>
        <p className="text-gray-500 mt-2">Agenda un evento, mantenimiento o reserva vinculable a un activo.</p>
      </div>

      {organizations.length === 0 ? (
        <div className="p-6 text-center border bg-orange-50 text-orange-800 rounded-lg">
          Necesitas una Organización para empezar a agendar.
        </div>
      ) : (
        <EventForm 
          organizations={organizations.map(o => ({ id: o.id, name: o.name }))} 
          assets={allAssets}
        />
      )}
    </div>
  );
}