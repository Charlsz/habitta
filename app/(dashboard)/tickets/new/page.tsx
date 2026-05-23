import { TicketForm } from "@/modules/tickets/presentation/ticket-form";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import Link from "next/link";

export default async function NewTicketPage() {
  const user = await requireAuth();
  
  // Traemos la data para popular el formulario
  const organizations = await getOrganizations(user.id);
  
  // Para no complicar la hackathon con llamadas ajax en cascada, 
  // precargamos los assets de TODAS las orgs del usuario. 
  // El Client Component 'TicketForm' filtrará en memoria.
  let allAssets: any[] = [];
  for (const org of organizations) {
    const assets = await getAssetsByOrganization(org.id);
    allAssets = [...allAssets, ...assets];
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/tickets" className="text-blue-600 text-sm mb-4 inline-block hover:underline">
          ← Volver a tickets
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Ticket</h1>
        <p className="text-gray-500 mt-2">Especifica los detalles de la incidencia técnica o administrativa.</p>
      </div>

      {organizations.length === 0 ? (
        <div className="p-6 text-center border bg-orange-50 text-orange-800 rounded-lg">
          Debes crear o pertenecer a una <strong>Organización</strong> primero para poder levantar un ticket.
        </div>
      ) : (
        <TicketForm 
          organizations={organizations.map(o => ({ id: o.id, name: o.name }))} 
          assets={allAssets}
        />
      )}
    </div>
  );
}