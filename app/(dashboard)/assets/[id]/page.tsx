import { notFound } from "next/navigation";
import Link from "next/link";
import { getAssetById } from "@/modules/assets/infrastructure/asset.repository";
import { getRelationsByAsset } from "@/modules/relationships/infrastructure/relation.repository";
import { getOrgMembers } from "@/modules/tickets/infrastructure/ticket.repository";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import {
  assignRelationAction,
  removeRelationAction,
} from "@/modules/relationships/application/relation.actions";
import {
  ASSET_TYPE_LABELS,
  ASSET_TYPE_COLORS,
} from "@/modules/assets/domain/asset.schema";
import type { AssetType } from "@/modules/assets/domain/asset.schema";
import {
  RELATION_TYPE_LABELS,
  RELATION_TYPE_COLORS,
  RELATION_TYPE_ICONS,
} from "@/modules/relationships/domain/relation.schema";
import type { RelationType } from "@/modules/relationships/domain/relation.schema";

const RELATION_OPTIONS: { value: RelationType; label: string }[] = [
  { value: "owner",       label: "Propietario" },
  { value: "tenant",      label: "Arrendatario" },
  { value: "responsible", label: "Responsable" },
  { value: "resident",    label: "Residente" },
];

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let asset;
  try {
    asset = await getAssetById(id);
  } catch {
    notFound();
  }

  const { role } = await requireOrgRole(asset.organization_id, ["owner", "admin", "member"]);
  const isAdmin   = role === "owner" || role === "admin";

  const [relations, members] = await Promise.all([
    getRelationsByAsset(id),
    isAdmin ? getOrgMembers(asset.organization_id) : Promise.resolve([]),
  ]);

  const typeKey   = (asset.asset_type ?? "other") as AssetType;
  const typeLabel = ASSET_TYPE_LABELS[typeKey];
  const typeColor = ASSET_TYPE_COLORS[typeKey];

  const assignedUserIds  = new Set(relations.map((r) => r.user_id));
  const availableMembers = members.filter((m) => !assignedUserIds.has(m.user_id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/assets" className="habitta-link text-sm inline-block">
        ← Volver a unidades
      </Link>

      {/* ---- Header de la unidad ---- */}
      <div className="habitta-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex gap-2 flex-wrap">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColor}`}>
                {typeLabel}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                  ? "En mantenimiento"
                  : "Inactivo"}
              </span>
            </div>
            <h1 className="text-2xl font-bold habitta-title">{asset.name}</h1>
            {asset.code && (
              <p className="text-xs font-mono text-[var(--muted)]">{asset.code}</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
          {asset.location && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Ubicación</p>
              <p className="text-sm mt-1">{asset.location}</p>
            </div>
          )}
          {asset.description && (
            <div>
              <p className="text-xs font-semibold habitta-muted uppercase tracking-wide">Descripción</p>
              <p className="text-sm mt-1">{asset.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Responsables y ocupantes ---- */}
      <div className="habitta-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <h2 className="font-bold text-[var(--foreground)]">👥 Responsables y ocupantes</h2>
          <span className="text-xs habitta-muted">{relations.length} persona{relations.length !== 1 ? "s" : ""}</span>
        </div>

        {relations.length === 0 ? (
          <p className="p-5 text-sm habitta-muted italic">No hay personas asignadas a esta unidad.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {relations.map((r) => {
              const rt = r.relation_type as RelationType;
              return (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-full bg-[#d4a373]/20 flex items-center justify-center text-[#d4a373] font-bold text-sm shrink-0">
                    {(r.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {r.profiles?.full_name ?? r.user_id}
                      {r.is_primary && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[#c8935f]">Principal</span>
                      )}
                    </p>
                    <span className={`inline-flex items-center gap-1 mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${RELATION_TYPE_COLORS[rt]}`}>
                      {RELATION_TYPE_ICONS[rt]} {RELATION_TYPE_LABELS[rt]}
                    </span>
                  </div>

                  {isAdmin && (
                    <form
                      action={async (fd: FormData) => {
                        "use server";
                        await removeRelationAction(fd);
                      }}
                    >
                      <input type="hidden" name="organization_id" value={asset.organization_id} />
                      <input type="hidden" name="asset_id"        value={asset.id} />
                      <input type="hidden" name="user_id"         value={r.user_id} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors shrink-0"
                      >
                        Quitar
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---- Formulario de asignación (solo admin) ---- */}
      {isAdmin && (
        <div className="habitta-card p-5 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--foreground)]">
            ➕ Asignar persona a esta unidad
          </h3>

          {availableMembers.length === 0 ? (
            <p className="text-sm habitta-muted italic">
              Todos los miembros de la organización ya están asignados a esta unidad.
            </p>
          ) : (
            <form
              action={async (fd: FormData) => {
                "use server";
                await assignRelationAction(fd);
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            >
              <input type="hidden" name="organization_id" value={asset.organization_id} />
              <input type="hidden" name="asset_id"        value={asset.id} />

              <div className="sm:col-span-1">
                <label className="text-xs font-semibold habitta-muted uppercase tracking-wide block mb-1">
                  Miembro
                </label>
                <select
                  name="user_id"
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
                >
                  <option value="">Selecciona un miembro</option>
                  {availableMembers.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profiles?.full_name ?? m.user_id} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold habitta-muted uppercase tracking-wide block mb-1">
                  Tipo de relación
                </label>
                <select
                  name="relation_type"
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
                >
                  {RELATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold habitta-muted uppercase tracking-wide block mb-1">
                  ¿Responsable principal?
                </label>
                <select
                  name="is_primary"
                  className="w-full text-sm border border-[var(--border)] rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#d4a373]"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Asignar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
