import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getOrganizationById } from "@/modules/organizations/infrastructure/organization.repository";
import { getAssetsByOrganization } from "@/modules/assets/infrastructure/asset.repository";
import { AssetForm } from "@/modules/assets/presentation/asset-form";
import { TelegramLinkButton } from "@/modules/telegram/presentation/telegram-link-button";
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

const ASSET_STATUS_STYLE: Record<string, string> = {
  active:      "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive:    "bg-[var(--surface)] text-[var(--foreground)]/50",
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
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">

      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/organizations"
          className="text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 transition-colors inline-flex items-center gap-1 mb-3"
        >
          ← Volver al listado
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {org.name}
        </h1>
        <p className="text-sm text-[var(--foreground)]/50 mt-0.5">
          {ORG_TYPE_LABELS[org.type] ?? org.type}
        </p>
      </div>

      {/* Telegram */}
      <TelegramLinkButton organizationId={org.id} organizationName={org.name} />

      {/* Ir al dashboard de esta org */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard?org=${org.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-[#d4a373] text-white hover:bg-[#c8935f] transition-colors shadow-sm"
        >
          Ver dashboard →
        </Link>
        <Link
          href={`/tickets?org=${org.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            border border-[var(--border)] text-[var(--foreground)]/70
            hover:bg-white/60 transition-colors"
        >
          Ver tickets
        </Link>
      </div>

      {/* Unidades + Form */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Listado */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Unidades registradas
            <span className="ml-2 text-xs font-normal text-[var(--foreground)]/40">({assets.length})</span>
          </h2>

          {assets.length === 0 ? (
            <div className="habitta-card p-8 text-center">
              <p className="text-sm text-[var(--foreground)]/50">
                No hay unidades registradas aún. Usa el formulario para agregar la primera.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}?org=${org.id}`}
                  className="habitta-card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] leading-tight">
                      {asset.name}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      ASSET_STATUS_STYLE[asset.status] ?? ASSET_STATUS_STYLE.inactive
                    }`}>
                      {ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                    </span>
                  </div>
                  {asset.location && (
                    <p className="text-xs text-[var(--foreground)]/50">📍 {asset.location}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Form nueva unidad */}
        <div className="habitta-card-high p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Agregar Unidad</h3>
          <AssetForm organizationId={org.id} />
        </div>
      </div>
    </div>
  );
}
