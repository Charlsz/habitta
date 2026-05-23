import { z } from "zod";

export const EventStatusEnum = z.enum(["pending", "approved", "rejected", "completed"]);

export const eventSchema = z.object({
  organization_id: z.string().uuid(),
  asset_id: z.string().uuid().optional().nullable(),
  ticket_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  start_time: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Fecha de inicio inválida" }),
  end_time: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Fecha de fin inválida" }),
}).refine(data => new Date(data.start_time) < new Date(data.end_time), {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["end_time"]
});

export type EventStatus = z.infer<typeof EventStatusEnum>;
export type EventInsert = z.infer<typeof eventSchema>;

export interface ScheduleEvent {
  id: string;
  organization_id: string;
  creator_id: string;
  asset_id: string | null;
  ticket_id: string | null;
  title: string;
  description: string | null;
  status: EventStatus;
  start_time: string;
  end_time: string;
  created_at: string;
}
