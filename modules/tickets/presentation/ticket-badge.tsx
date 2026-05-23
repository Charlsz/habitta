import { cn } from "@/lib/utils";
import { TicketPriority, TicketStatus } from "../domain/ticket.schema";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800"
  };
  
  const labels: Record<TicketStatus, string> = {
    open: "Abierto",
    in_progress: "En Progreso",
    resolved: "Resuelto",
    closed: "Cerrado"
  };

  return (
    <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700"
  };

  const labels: Record<TicketPriority, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente"
  };

  return (
    <span className={cn("px-2 py-1 text-[10px] font-bold uppercase rounded-sm border", styles[priority])}>
      {labels[priority]}
    </span>
  );
}
