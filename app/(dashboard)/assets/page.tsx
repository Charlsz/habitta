import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import Link from "next/link";

export default async function AssetsPage() {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);
  const assetsByOrg = await Promise.all(
    orgs.map(async (org) => ({
      org,
      assets: await getAssetsByOrganization(org.id),
    }))
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
          <p className="habitta-muted">Crea una organización para empezar a registrar activos.</p>
          <Link href="/organizations/new" className="habitta-primary inline-flex px-4 py-2 mt-4">
            Crear Organización
          </Link>
        </div>
      ) : totalAssets === 0 ? (
        <div className="habitta-card p-8 text-center">
          <p className="habitta-muted">Todavía no tienes activos registrados.</p>
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
                  {assets.map((asset) => (
                    <article key={asset.id} className="habitta-card-high p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-[var(--foreground)]">{asset.name}</h3>
                          {asset.location && (
                            <p className="habitta-muted text-sm mt-1">{asset.location}</p>
                          )}
                        </div>
                        <span className="rounded-full bg-[var(--color-lima)] px-2 py-1 text-xs font-semibold text-[var(--foreground)]">
                          {asset.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
