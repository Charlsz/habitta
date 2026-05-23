import { cn } from "@/lib/utils";
import { EventStatus } from "../domain/event.schema";

export function EventStatusBadge({ status }: { status: EventStatus | string }) {
  const mapping: Record<string, { bg: string, label: string }> = {
    pending: { bg: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
    approved: { bg: "bg-green-100 text-green-800", label: "Aprobado" },
    rejected: { bg: "bg-red-100 text-red-800", label: "Rechazado" },
    completed: { bg: "bg-gray-100 text-gray-800", label: "Completado" },
  };

  const current = mapping[status] || mapping.pending;

  return (
    <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", current.bg)}>
      {current.label}
    </span>
  );
}
