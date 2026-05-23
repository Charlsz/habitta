import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getOrganizationById } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { AssetForm } from "@/modules/assets/presentation/asset-form";
import Link from "next/link";

const ORG_TYPE_LABELS: Record<string, string> = {
  residential:  "Residencial / Condominio",
  construction: "Constructora",
  real_estate:  "Inmobiliaria",
  other:        "Otro",
};

const ASSET_STATUS_LABELS: Record<string, string> = {
  active:      "Activo",
  maintenance: "En mantenimiento",
  inactive:    "Inactivo",
};

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOrgRole(id, ["owner", "admin", "member"]);

  const org    = await getOrganizationById(id);
  const assets = await getAssetsByOrganization(id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/organizations" className="habitta-link text-sm mb-4 inline-block">
          ← Volver al listado
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
        <p className="text-gray-500 mt-1">
          {ORG_TYPE_LABELS[org.type] ?? org.type}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Listado de Unidades */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Unidades registradas ({assets.length})</h2>

          {assets.length === 0 ? (
            <div className="habitta-card p-6 text-center habitta-muted">
              No hay unidades registradas aún. Usa el panel lateral para agregar la primera.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-bold">{asset.name}</h3>
                  {asset.location && (
                    <p className="text-sm text-gray-500 mt-1">📍 {asset.location}</p>
                  )}
                  <span
                    className={`inline-block mt-3 text-xs px-2 py-1 rounded-full font-medium ${
                      asset.status === "active"
                        ? "bg-green-100 text-green-700"
                        : asset.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral: Nueva Unidad */}
        <div>
          <h3 className="text-lg font-bold mb-3">Agregar Unidad</h3>
          <AssetForm organizationId={org.id} />
        </div>
      </div>
    </div>
  );
}
