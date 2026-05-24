import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import type { AnalyticsData } from "@/modules/dashboard/application/analytics.actions";

export function AnalyticsStatCards({ stats }: { stats: AnalyticsData["statCards"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tickets abiertos"
        value={stats.totalOpen.toString()}
        icon={<TrendingUp className="w-5 h-5" />}
        color="#3b82f6"
      />
      <StatCard
        title="Cerrados este mes"
        value={stats.closedThisMonth.toString()}
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="#10b981"
      />
      <StatCard
        title="Urgentes activos"
        value={stats.urgentOpen.toString()}
        icon={<AlertTriangle className="w-5 h-5" />}
        color="#ef4444"
        highlight={stats.urgentOpen > 0}
      />
      <StatCard
        title="Tiempo promedio resolución"
        value={stats.avgResolutionHours !== null ? `${stats.avgResolutionHours}h` : "N/A"}
        icon={<Clock className="w-5 h-5" />}
        color="#f97316"
      />
    </div>
  );
}

function StatCard({
  title, value, icon, color, highlight = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`habitta-card p-5 flex flex-col justify-between ${
        highlight ? "ring-2 ring-red-300 ring-offset-1" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xs text-[var(--muted)] uppercase tracking-wide leading-tight">
          {title}
        </h3>
        <div className="p-2 rounded-md" style={{ backgroundColor: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="habitta-title text-3xl" style={highlight ? { color: "#ef4444" } : {}}>
        {value}
      </p>
    </div>
  );
}
