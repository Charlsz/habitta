import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { EventInsert, EventStatus, ScheduleEvent } from "../domain/event.schema";

export async function getEvents(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles (full_name),
      assets (name)
    `)
    .eq("organization_id", organizationId)
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function checkAssetAvailability(assetId: string, startTime: string, endTime: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Solapamiento: Un evento existe si empieza ANTES del nuevo fin, y termina DESPUÉS del nuevo inicio.
  // Ignoramos los rechazados.
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("asset_id", assetId)
    .neq("status", "rejected")
    .lt("start_time", endTime)
    .gt("end_time", startTime)
    .limit(1);

  if (error) throw new Error(error.message);
  return data.length === 0; // true si está disponible (no hay cruces)
}

export async function createEvent(event: EventInsert, userId: string): Promise<ScheduleEvent> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .insert([{
      organization_id: event.organization_id,
      creator_id: userId,
      asset_id: event.asset_id || null,
      ticket_id: event.ticket_id || null,
      title: event.title,
      description: event.description || null,
      start_time: event.start_time,
      end_time: event.end_time,
      status: "pending"
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ScheduleEvent;
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId);
    
  if (error) throw new Error(error.message);
}
