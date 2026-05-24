/**
 * Tiempo límite de resolución para tickets en Habitta.
 * Cálculos usando created_at del ticket.
 */

export const DEADLINE_HOURS: Record<string, number> = {
  urgent: 2,
  high:   24,
  medium: 72,
  low:    168,
};

/** @deprecated usa DEADLINE_HOURS */
export const SLA_HOURS = DEADLINE_HOURS;

export type DeadlineStatus = "on_track" | "at_risk" | "overdue";
/** @deprecated usa DeadlineStatus */
export type SLAStatus = DeadlineStatus;

export interface DeadlineResult {
  status:          DeadlineStatus;
  percentElapsed:  number;
  msRemaining:     number;
  label:           string;
}
/** @deprecated usa DeadlineResult */
export type SLAResult = DeadlineResult;

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

export function getDeadlineResult(
  priority: string,
  createdAt: string,
  ticketStatus: string
): DeadlineResult | null {
  if (ticketStatus === "closed" || ticketStatus === "resolved") return null;

  const totalMs  = (DEADLINE_HOURS[priority] ?? 72) * 3_600_000;
  const elapsed  = Date.now() - new Date(createdAt).getTime();
  const remaining = totalMs - elapsed;
  const pct       = Math.min(Math.round((elapsed / totalMs) * 100), 999);

  let status: DeadlineStatus;
  if (pct < 75)       status = "on_track";
  else if (pct < 100) status = "at_risk";
  else                status = "overdue";

  const label =
    remaining > 0
      ? `${fmtDuration(remaining)} restantes`
      : `Vencido hace ${fmtDuration(remaining)}`;

  return { status, percentElapsed: pct, msRemaining: remaining, label };
}

/** @deprecated usa getDeadlineResult */
export const getSLAResult = getDeadlineResult;

export const DEADLINE_STYLES: Record<DeadlineStatus, { bg: string; text: string; ring: string; dot: string; emoji: string }> = {
  on_track: { bg: "bg-green-50",  text: "text-green-700",  ring: "ring-green-200",  dot: "bg-green-500",  emoji: "🟢" },
  at_risk:  { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200", dot: "bg-yellow-400", emoji: "🟡" },
  overdue:  { bg: "bg-red-50",    text: "text-red-600",    ring: "ring-red-200",    dot: "bg-red-500",   emoji: "🔴" },
};

/** @deprecated usa DEADLINE_STYLES */
export const SLA_STYLES = DEADLINE_STYLES;
