import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Ticket, TicketComment, TicketInsert, TicketStatus } from "../domain/ticket.schema";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getTickets(organizationId: string, filters?: { status?: string; asset_id?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("tickets")
    .select(`*, assets (name), profiles (full_name)`)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.asset_id && filters.asset_id !== "all") query = query.eq("asset_id", filters.asset_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(`*, assets (name, location), profiles (full_name)`)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketComments(ticketId: string): Promise<TicketComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_comments")
    .select(`*, profiles(full_name)`)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as unknown as TicketComment[];
}

export async function createTicket(ticket: TicketInsert, userId: string): Promise<Ticket> {
  const admin = getAdmin();
  const { data, error } = await admin.rpc("create_ticket_for_user", {
    p_organization_id: ticket.organization_id,
    p_creator_id: userId,
    p_asset_id: ticket.asset_id || null,
    p_title: ticket.title,
    p_description: ticket.description,
    p_priority: ticket.priority,
  });
  if (error) throw new Error(error.message);
  return data as Ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const admin = getAdmin();
  const { error } = await admin.rpc("update_ticket_status_for_user", {
    p_ticket_id: id,
    p_status: status,
    p_user_id: null,
  });
  if (error) throw new Error(error.message);
}

export async function addTicketComment(ticketId: string, userId: string, message: string) {
  const admin = getAdmin();
  const { error } = await admin.rpc("add_ticket_comment_for_user", {
    p_ticket_id: ticketId,
    p_creator_id: userId,
    p_message: message,
  });
  if (error) throw new Error(error.message);
}

export async function uploadTicketAttachment(file: File, orgId: string, ticketId: string, userId: string) {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${ticketId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("attachments").upload(fileName, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(fileName);

  const admin = getAdmin();
  const { error: dbError } = await admin.from("attachments").insert([{
    organization_id: orgId,
    uploader_id: userId,
    context: "ticket",
    record_id: ticketId,
    file_url: publicUrl,
    file_name: file.name,
  }]);
  if (dbError) throw new Error(dbError.message);
  return publicUrl;
}

export async function getTicketAttachments(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("context", "ticket")
    .eq("record_id", ticketId);
  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketOrganizationId(ticketId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("organization_id")
    .eq("id", ticketId)
    .single();
  if (error) throw new Error(error.message);
  return data.organization_id;
}