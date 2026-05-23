import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getCategoriesByOrg } from "@/modules/ticket-categories/infrastructure/category.repository";
import {
  saveCategoryAction,
  deleteCategoryAction,
} from "@/modules/ticket-categories/application/category.actions";
import Link from "next/link";

export default async function OrgSettingsPage({ params }: { params: { id: string } }) {
  const orgId = params.id;
  await requireOrgRole(orgId, ["owner", "admin"]);
  const categories = await getCategoriesByOrg(orgId);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/organizations" className="habitta-link text-sm mb-2 inline-block">
          \u2190 Volver
        </Link>
        <h1 className="habitta-title text-2xl">Configuraci\u00f3n de categor\u00edas</h1>
        <p className="habitta-muted text-sm mt-1">Gestiona las categor\u00edas de tickets de tu organizaci\u00f3n.</p>
      </div>

      {/* Lista de categorías */}
      <div className="habitta-card divide-y">
        {categories.length === 0 ? (
          <p className="p-6 text-sm habitta-muted italic text-center">No hay categor\u00edas a\u00fan. Crea una abajo.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <p className="text-sm font-semibold">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs habitta-muted">{cat.description}</p>
                  )}
                </div>
              </div>
              <form
                action={async (fd: FormData) => {
                  "use server";
                  await deleteCategoryAction(fd);
                }}
              >
                <input type="hidden" name="organization_id" value={orgId} />
                <input type="hidden" name="id" value={cat.id} />
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Formulario de nueva categoría */}
      <div className="habitta-card p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide">Nueva categor\u00eda</h2>
        <form
          action={async (fd: FormData) => {
            "use server";
            await saveCategoryAction(fd);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="organization_id" value={orgId} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                name="name"
                required
                placeholder="Ej: Mantenimiento"
                className="w-full mt-1 border border-[var(--border)] px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#d4a373] bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <input
                type="color"
                name="color"
                defaultValue="#6B7280"
                className="w-full mt-1 h-[38px] border border-[var(--border)] rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Descripci\u00f3n <span className="text-xs habitta-muted">(opcional)</span>
            </label>
            <input
              name="description"
              placeholder="Descripci\u00f3n breve de la categor\u00eda"
              className="w-full mt-1 border border-[var(--border)] px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#d4a373] bg-white"
            />
          </div>

          <button
            type="submit"
            className="bg-[#d4a373] hover:bg-[#c8935f] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Crear categor\u00eda
          </button>
        </form>
      </div>
    </div>
  );
}
