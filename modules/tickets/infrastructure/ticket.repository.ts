import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { Ticket, TicketComment, TicketInsert, TicketStatus } from "../domain/ticket.schema";

export async function getTickets(organizationId: string, filters?: { status?: string, asset_id?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("tickets")
    .select(`
      *,
      assets (name),
      profiles (full_name)
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq("status", filters.status);
  }
  if (filters?.asset_id && filters.asset_id !== 'all') {
    query = query.eq("asset_id", filters.asset_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      assets (name, location),
      profiles (full_name)
    `)
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .insert([{
      organization_id: ticket.organization_id,
      creator_id: userId,
      asset_id: ticket.asset_id || null,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: "open"
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addTicketComment(ticketId: string, userId: string, message: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ticket_comments")
    .insert([{ ticket_id: ticketId, creator_id: userId, message }]);
  if (error) throw new Error(error.message);
}

export async function uploadTicketAttachment(file: File, orgId: string, ticketId: string, userId: string) {
  const supabase = await createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${ticketId}/${Date.now()}.${fileExt}`;
  
  // 1. Storage Upload
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(fileName, file);
    
  if (uploadError) throw new Error(uploadError.message);

  // Generar URL pública (asumiendo que el bucket es publico para la hackathon)
  const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(fileName);

  // 2. Registro en DB
  const { error: dbError } = await supabase
    .from("attachments")
    .insert([{
      organization_id: orgId,
      uploader_id: userId,
      context: "ticket",
      record_id: ticketId,
      file_url: publicUrl,
      file_name: file.name
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
