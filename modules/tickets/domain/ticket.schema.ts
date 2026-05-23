import { z } from "zod";

export const TicketStatusEnum = z.enum([
  "open",
  "in_review",
  "in_progress",
  "on_hold",
  "resolved",
  "rejected",
  "closed",
]);

export const TicketPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const TICKET_STATUS_LABELS: Record<z.infer<typeof TicketStatusEnum>, string> = {
  open:        "Abierto",
  in_review:   "En revisión",
  in_progress: "En proceso",
  on_hold:     "En espera",
  resolved:    "Resuelto",
  rejected:    "Rechazado",
  closed:      "Cerrado",
};

export const TICKET_STATUS_COLORS: Record<z.infer<typeof TicketStatusEnum>, string> = {
  open:        "bg-blue-100 text-blue-800",
  in_review:   "bg-purple-100 text-purple-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  on_hold:     "bg-orange-100 text-orange-800",
  resolved:    "bg-green-100 text-green-800",
  rejected:    "bg-red-100 text-red-800",
  closed:      "bg-gray-100 text-gray-600",
};

export const ticketSchema = z.object({
  organization_id: z.string().uuid(),
  asset_id:        z.string().uuid().optional().nullable(),
  title:           z.string().min(3, "El título es muy corto"),
  description:     z.string().min(5, "Debes agregar una descripción"),
  priority:        TicketPriorityEnum.default("medium"),
  due_date:        z.string().optional().nullable(),
});

export type TicketStatus   = z.infer<typeof TicketStatusEnum>;
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;
export type TicketInsert   = z.input<typeof ticketSchema>;

export interface Ticket extends TicketInsert {
  id:          string;
  creator_id:  string;
  category_id: string | null;
  assigned_to: string | null;
  status:      TicketStatus;
  response:    string | null;
  due_date:    string | null;
  closed_at:   string | null;
  created_at:  string;
  updated_at:  string;
}

export interface TicketComment {
  id:         string;
  ticket_id:  string;
  creator_id: string;
  message:    string;
  created_at: string;
  profiles:   { full_name: string };
}
