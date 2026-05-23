import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import Link from "next/link";

export default async function OrganizationsPage() {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mis Organizaciones</h1>
        <Link 
          href="/organizations/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm"
        >
          + Nueva Organización
        </Link>
      </div>

      {orgs.length === 0 ? (
        <div className="text-center py-10 bg-white border rounded-xl shadow-sm">
          <p className="text-gray-500">No perteneces a ninguna organización aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org.id} href={`/organizations/${org.id}`}>
              <div className="p-6 bg-white rounded-xl border shadow-sm hover:border-blue-500 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg">{org.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{org.type.replace('_', ' ')}</p>
                <div className="mt-4 text-xs font-medium text-blue-600">Ver detalles →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}