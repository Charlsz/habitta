import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getAnalyticsData } from "@/modules/dashboard/application/analytics.actions";
import { AnalyticsCharts } from "@/modules/dashboard/presentation/analytics/AnalyticsCharts";
import { AnalyticsStatCards } from "@/modules/dashboard/presentation/analytics/AnalyticsStatCards";
import { AnalyticsTopLocations } from "@/modules/dashboard/presentation/analytics/AnalyticsTopLocations";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

export const metadata = { title: "Analytics — Habitta" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: requestedOrgId } = await searchParams;
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="habitta-title text-2xl">Sin organizaciones</h2>
        <p className="habitta-muted">Crea o únete a una organización para ver analytics.</p>
        <Link href="/organizations/new" className="habitta-primary px-4 py-2">Crear Organización</Link>
      </div>
    );
  }

  const currentOrg = orgs.find((o) => o.id === requestedOrgId) ?? orgs[0];
  const data = await getAnalyticsData(currentOrg.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#d4a37318" }}>
            <BarChart2 className="w-5 h-5" style={{ color: "#d4a373" }} />
          </div>
          <div>
            <h1 className="habitta-title text-3xl">Analytics</h1>
            <p className="habitta-muted text-sm mt-0.5">
              Análisis operativo de <strong>{currentOrg.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {orgs.length > 1 && (
            <form className="habitta-card-high flex items-center gap-2 px-3 py-1.5">
              <span className="text-xs font-semibold text-[var(--muted)]">ORG:</span>
              <select name="org" defaultValue={currentOrg.id} className="text-sm font-medium outline-none bg-transparent">
                {orgs.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
              </select>
              <button type="submit" className="habitta-secondary px-2 py-1 text-xs">Ver</button>
            </form>
          )}
          <Link href="/dashboard" className="habitta-muted text-sm hover:underline">← Panel general</Link>
        </div>
      </div>

      {/* Stat cards */}
      <AnalyticsStatCards stats={data.statCards} />

      {/* Gráficas */}
      <AnalyticsCharts data={data} />

      {/* Top ubicaciones */}
      <AnalyticsTopLocations locations={data.topLocations} />
    </div>
  );
}
