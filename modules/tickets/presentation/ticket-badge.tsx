import { cn } from "@/lib/utils";
import {
  TicketPriority,
  TicketStatus,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
} from "../domain/ticket.schema";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-semibold rounded-full",
        TICKET_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
      )}
    >
      {TICKET_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    low:    "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high:   "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const labels: Record<TicketPriority, string> = {
    low:    "Baja",
    medium: "Media",
    high:   "Alta",
    urgent: "Urgente",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 text-[10px] font-bold uppercase rounded-sm border",
        styles[priority]
      )}
    >
      {labels[priority]}
    </span>
  );
}
