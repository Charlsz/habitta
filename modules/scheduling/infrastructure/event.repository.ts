import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { EventInsert, EventStatus, ScheduleEvent } from "../domain/event.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getEvents(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`*, profiles (full_name), assets (name)`)
    .eq("organization_id", organizationId)
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function checkAssetAvailability(assetId: string, startTime: string, endTime: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("asset_id", assetId)
    .neq("status", "rejected")
    .lt("start_time", endTime)
    .gt("end_time", startTime)
    .limit(1);
  if (error) throw new Error(error.message);
  return data.length === 0;
}

export async function createEvent(event: EventInsert, userId: string): Promise<ScheduleEvent> {
  const admin = getAdmin();
  const { data, error } = await admin.rpc("create_event_for_user", {
    p_organization_id: event.organization_id,
    p_creator_id: userId,
    p_asset_id: event.asset_id || null,
    p_title: event.title,
    p_description: event.description || null,
    p_start_date: event.start_time,
    p_end_date: event.end_time,
  });
  if (error) throw new Error(error.message);
  return data as ScheduleEvent;
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  const admin = getAdmin();
  const { error } = await admin
    .from("events")
    .update({ status })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
}

export async function getEventOrganizationId(eventId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("organization_id")
    .eq("id", eventId)
    .single();
  if (error) throw new Error(error.message);
  return data.organization_id;
}