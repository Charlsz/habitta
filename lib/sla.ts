/**
 * SLA utilities para Habitta.
 * Cálculos en cliente usando created_at o sla_due_at del ticket.
 */

export const SLA_HOURS: Record<string, number> = {
  urgent: 2,
  high:   24,
  medium: 72,
  low:    168,
};

export type SLAStatus = "on_track" | "at_risk" | "overdue";

export interface SLAResult {
  status:          SLAStatus;
  percentElapsed:  number;          // 0-100+
  msRemaining:     number;          // negativo si vencido
  label:           string;          // "2h restantes" | "Vencido hace 3h"
}

/** Convierte millisegundos a etiqueta legible: "2h 30m", "45m", etc. */
function fmtDuration(ms: number): string {
  const totalMin = Math.round(Math.abs(ms) / 60_000);
  if (totalMin < 60)  return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h < 48) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export function getSLAResult(
  priority: string,
  createdAt: string,
  slaStatus: string        // ticket status — skip if closed/resolved
): SLAResult | null {
  if (slaStatus === "closed" || slaStatus === "resolved") return null;

  const slaTotalMs = (SLA_HOURS[priority] ?? 72) * 3_600_000;
  const elapsed    = Date.now() - new Date(createdAt).getTime();
  const remaining  = slaTotalMs - elapsed;
  const pct        = Math.min(Math.round((elapsed / slaTotalMs) * 100), 999);

  let status: SLAStatus;
  if (pct < 75)        status = "on_track";
  else if (pct < 100)  status = "at_risk";
  else                 status = "overdue";

  const label =
    remaining > 0
      ? `${fmtDuration(remaining)} restantes`
      : `Vencido hace ${fmtDuration(remaining)}`;

  return { status, percentElapsed: pct, msRemaining: remaining, label };
}

/** Devuelve clases Tailwind + emoji por status */
export const SLA_STYLES: Record<SLAStatus, { bg: string; text: string; ring: string; dot: string; emoji: string }> = {
  on_track: { bg: "bg-green-50",  text: "text-green-700", ring: "ring-green-200", dot: "bg-green-500",  emoji: "🟢" },
  at_risk:  { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200", dot: "bg-yellow-400", emoji: "🟡" },
  overdue:  { bg: "bg-red-50",    text: "text-red-600",    ring: "ring-red-200",   dot: "bg-red-500",   emoji: "🔴" },
};
