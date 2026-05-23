import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getOrganizationById } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { AssetForm } from "@/modules/assets/presentation/asset-form";
import Link from "next/link";

export default async function OrganizationDetailPage({ params }: { params: { id: string } }) {
  // Aseguramos que el usuario pueda ver esto
  await requireOrgRole(params.id, ["owner", "admin", "member"]);
  
  const org = await getOrganizationById(params.id);
  const assets = await getAssetsByOrganization(params.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/organizations" className="text-blue-600 text-sm mb-4 inline-block hover:underline">
          ← Volver a listado
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
        <p className="text-gray-500 mt-1 capitalize">Tipo: {org.type.replace('_', ' ')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Listado de Activos */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Activos Resguardados ({assets.length})</h2>
          
          {assets.length === 0 ? (
            <div className="p-6 bg-white rounded-lg border text-center text-gray-500">
              No hay activos registrados aún.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="p-4 bg-white rounded-lg border shadow-sm">
                  <h3 className="font-bold">{asset.name}</h3>
                  {asset.location && <p className="text-sm text-gray-500 mt-1">📍 {asset.location}</p>}
                  <span className={`inline-block mt-3 text-xs px-2 py-1 rounded-full font-medium ${
                    asset.status === 'active' ? 'bg-green-100 text-green-700' :
                    asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {asset.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral: Nuevo Activo */}
        <div>
          <AssetForm organizationId={org.id} />
        </div>
      </div>
    </div>
  );
}