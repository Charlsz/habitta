import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import Link from "next/link";

const ORG_TYPE_LABELS: Record<string, string> = {
  residential:  "Residencial",
  construction: "Constructora",
  real_estate:  "Inmobiliaria",
  other:        "Otro",
};

export default async function OrganizationsPage() {
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Organizaciones</h1>
        <Link
          href="/organizations/new"
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#d4a373' }}
        >
          + Nueva
        </Link>
      </div>

      {orgs.length === 0 ? (
        <div className="habitta-card p-10 text-center space-y-3">
          <p className="text-3xl">🏢</p>
          <p className="font-medium text-[var(--foreground)]">No perteneces a ninguna organización aún.</p>
          <Link
            href="/organizations/new"
            className="inline-block px-5 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#d4a373' }}
          >
            Crear organización
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/dashboard?org=${org.id}`}
              className="habitta-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: '#d4a37320' }}
                >
                  🏢
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/40 mt-1">
                  {ORG_TYPE_LABELS[org.type] ?? org.type}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[#d4a373] transition-colors">
                  {org.name}
                </h3>
              </div>
              <span className="text-xs text-[#d4a373] font-medium mt-auto">Ver dashboard →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
