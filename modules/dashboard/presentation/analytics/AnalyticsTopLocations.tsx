import { MapPin } from "lucide-react";
import type { AnalyticsData } from "@/modules/dashboard/application/analytics.actions";

export function AnalyticsTopLocations({ locations }: { locations: AnalyticsData["topLocations"] }) {
  const max = locations[0]?.count ?? 1;

  return (
    <div className="habitta-card-high overflow-hidden">
      <div className="p-4 border-b bg-[var(--surface)] flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[var(--muted)]" />
        <h3 className="font-bold text-[var(--foreground)]">Top 5 zonas con más reportes</h3>
      </div>
      {locations.length === 0 ? (
        <div className="p-8 text-center habitta-muted text-sm">
          No hay suficientes datos de ubicación aún. Los tickets con formato "Problema - Zona X" aparecerán aquí.
        </div>
      ) : (
        <ul className="divide-y">
          {locations.map((loc, idx) => {
            const barWidth = Math.round((loc.count / max) * 100);
            const isTop = idx === 0;
            return (
              <li key={loc.location} className="flex items-center gap-4 px-5 py-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                    isTop ? "bg-[#d4a373] text-white" : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{loc.location}</p>
                  <div className="mt-1 h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isTop ? "bg-[#d4a373]" : "bg-[var(--muted)]/40"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isTop ? "bg-[#d4a373]/15 text-[#c8935f]" : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {loc.count} ticket{loc.count !== 1 ? "s" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
