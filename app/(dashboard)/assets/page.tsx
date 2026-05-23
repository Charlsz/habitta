import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { getPrimaryResponsible } from "@/modules/relationships/infrastructure/relation.repository";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import {
  ASSET_TYPE_LABELS,
  ASSET_TYPE_COLORS,
} from "@/modules/assets/domain/asset.schema";
import type { AssetType } from "@/modules/assets/domain/asset.schema";
import {
  RELATION_TYPE_LABELS,
  RELATION_TYPE_ICONS,
} from "@/modules/relationships/domain/relation.schema";
import type { RelationType } from "@/modules/relationships/domain/relation.schema";
import Link from "next/link";

export default async function AssetsPage() {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  const assetsByOrg = await Promise.all(
    orgs.map(async (org) => {
      const assets = await getAssetsByOrganization(org.id);
      // Cargamos el responsable principal de cada activo en paralelo
      const assetsWithResponsible = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          primaryResponsible: await getPrimaryResponsible(asset.id).catch(() => null),
        }))
      );
      return { org, assets: assetsWithResponsible };
    })
  );

  const totalAssets = assetsByOrg.reduce((total, group) => total + group.assets.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="habitta-title text-3xl">Activos</h1>
        <p className="habitta-muted text-sm mt-1">
          Inventario operativo vinculado a tus organizaciones.
        </p>
      </div>

      {orgs.length === 0 ? (
        <div className="habitta-card p-8 text-center">
          <p className="habitta-muted">Crea una organizaci\u00f3n para empezar a registrar activos.</p>
          <Link href="/organizations/new" className="habitta-primary inline-flex px-4 py-2 mt-4">
            Crear Organizaci\u00f3n
          </Link>
        </div>
      ) : totalAssets === 0 ? (
        <div className="habitta-card p-8 text-center">
          <p className="habitta-muted">Todav\u00eda no tienes activos registrados.</p>
          <Link href={`/organizations/${orgs[0].id}`} className="habitta-primary inline-flex px-4 py-2 mt-4">
            Registrar Activo
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {assetsByOrg.map(({ org, assets }) => (
            <section key={org.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{org.name}</h2>
                  <p className="habitta-muted text-sm">{assets.length} activos registrados</p>
                </div>
                <Link href={`/organizations/${org.id}`} className="habitta-link text-sm">
                  Gestionar
                </Link>
              </div>

              {assets.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {assets.map((asset) => {
                    const typeKey   = (asset.asset_type ?? "other") as AssetType;
                    const typeLabel = ASSET_TYPE_LABELS[typeKey];
                    const typeColor = ASSET_TYPE_COLORS[typeKey];
                    const pr        = asset.primaryResponsible;

                    return (
                      <Link
                        key={asset.id}
                        href={`/assets/${asset.id}`}
                        className="habitta-card-high p-5 block hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-[var(--foreground)] truncate">{asset.name}</h3>
                            {asset.code && (
                              <p className="text-xs text-[var(--muted)] font-mono mt-0.5">{asset.code}</p>
                            )}
                            {asset.location && (
                              <p className="habitta-muted text-sm mt-1">{asset.location}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                asset.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : asset.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {asset.status === "active"
                                ? "Activo"
                                : asset.status === "maintenance"
                                ? "Mantenimiento"
                                : "Inactivo"}
                            </span>
                          </div>
                        </div>

                        {asset.description && (
                          <p className="habitta-muted text-sm mt-3 line-clamp-2">{asset.description}</p>
                        )}

                        {/* Responsable principal */}
                        {pr ? (
                          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#d4a373]/20 flex items-center justify-center text-[#d4a373] text-xs font-bold shrink-0">
                              {pr.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--foreground)] truncate">{pr.full_name}</p>
                              <p className="text-[10px] habitta-muted">
                                {RELATION_TYPE_ICONS[pr.relation_type as RelationType]}{" "}
                                {RELATION_TYPE_LABELS[pr.relation_type as RelationType]}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-[var(--border)]">
                            <p className="text-xs text-red-400 font-medium">Sin responsable asignado</p>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
