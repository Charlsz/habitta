"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import type { AnalyticsData } from "@/modules/dashboard/application/analytics.actions";

const TYPE_LABELS: Record<string, string> = {
  incidencia: "Incidencia",
  mantenimiento: "Mantenimiento",
  novedad_obra: "Novedad obra",
  pqr: "PQR",
  solicitud_administrativa: "Sol. Admin",
  solicitud_visita: "Sol. Visita",
  queja_operativa: "Queja op.",
  requerimiento_documental: "Req. Doc",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#9ca3af",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const typeData = data.ticketsByType.map((t) => ({
    ...t,
    label: TYPE_LABELS[t.type] ?? t.type,
  }));

  const priorityData = data.ticketsByPriority.map((p) => ({
    ...p,
    label: PRIORITY_LABELS[p.priority] ?? p.priority,
    fill: PRIORITY_COLORS[p.priority] ?? "#9ca3af",
  }));

  return (
    <div className="space-y-6">
      {/* Fila 1: por tipo + por prioridad */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="habitta-card-high p-6">
          <h3 className="font-bold text-[var(--foreground)] mb-4 border-b pb-2">
            Tickets por tipo — este mes
          </h3>
          {typeData.length === 0 ? (
            <p className="habitta-muted text-sm py-8 text-center">Sin tickets este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v: any) => [v, "Tickets"]} />
                <Bar dataKey="count" fill="#d4a373" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="habitta-card-high p-6">
          <h3 className="font-bold text-[var(--foreground)] mb-4 border-b pb-2">
            Tickets por prioridad — este mes
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: any) => [v, "Tickets"]} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                isAnimationActive
                // color per bar
                fill="#d4a373"
                label={false}
              >
                {priorityData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Leyenda manual de colores */}
          <div className="flex flex-wrap gap-3 mt-3">
            {priorityData.map((p) => (
              <span key={p.priority} className="flex items-center gap-1 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                {p.label}: {p.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 2: volumen semanal */}
      <div className="habitta-card-high p-6">
        <h3 className="font-bold text-[var(--foreground)] mb-4 border-b pb-2">
          Volumen de tickets — últimas 12 semanas
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.weeklyVolume} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v: any) => [v, "Tickets"]} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#d4a373"
              strokeWidth={2}
              dot={{ fill: "#d4a373", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
