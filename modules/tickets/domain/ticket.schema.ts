import { z } from "zod";

export const TicketStatusEnum = z.enum(["open", "in_progress", "resolved", "closed"]);
export const TicketPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const ticketSchema = z.object({
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3, "El título es muy corto"),
  description: z.string().min(5, "Debes agregar una descripción"),
  priority: TicketPriorityEnum.default("medium"),
});

export type TicketStatus = z.infer<typeof TicketStatusEnum>;
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;
export type TicketInsert = z.input<typeof ticketSchema>;

// Extendemos del insert para mantener Single Source of Truth
export interface Ticket extends TicketInsert {
  id: string;
  creator_id: string;
  category_id: string | null;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  creator_id: string;
  message: string;
  created_at: string;
  profiles: { full_name: string }; // joined from public.profiles
}
