import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { TicketInsert } from "../domain/ticket.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type OrgMember = {
  user_id: string;
  role: "owner" | "admin" | "member";
  profiles: { full_name: string | null } | null;
};

export async function getTickets(
  orgId: string,
  filters?: { status?: string; asset_id?: string }
) {
  const supabase = await createClient();
  let query = supabase
    .from("tickets")
    .select(`
      *,
      profiles   (full_name),
      assets     (name),
      assignee:profiles!tickets_assigned_to_fkey (full_name),
      ticket_categories (name, color)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.asset_id && filters.asset_id !== "all") {
    query = query.eq("asset_id", filters.asset_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      profiles   (full_name),
      assets     (name),
      assignee:profiles!tickets_assigned_to_fkey (full_name),
      ticket_categories (name, color)
    `)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createTicket(data: TicketInsert & { category_id?: string | null }, creatorId: string) {
  const admin = getAdmin();
  const { data: ticket, error } = await admin
    .from("tickets")
    .insert({
      ...data,
      creator_id: creatorId,
      status:     "open",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return ticket;
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const admin = getAdmin();
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "resolved" || status === "closed") {
    updates.closed_at = new Date().toISOString();
  }
  const { error } = await admin.from("tickets").update(updates).eq("id", ticketId);
  if (error) throw new Error(error.message);
}

export async function respondToTicket(ticketId: string, response: string) {
  const admin = getAdmin();
  const { error } = await admin
    .from("tickets")
    .update({ response, updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw new Error(error.message);
}

export async function assignTicket(ticketId: string, userId: string | null) {
  const admin = getAdmin();
  const { error } = await admin
    .from("tickets")
    .update({ assigned_to: userId, updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw new Error(error.message);
}

export async function addTicketComment(ticketId: string, userId: string, message: string) {
  const admin = getAdmin();
  const { error } = await admin
    .from("ticket_comments")
    .insert({ ticket_id: ticketId, creator_id: userId, message });
  if (error) throw new Error(error.message);
}

export async function getTicketComments(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_comments")
    .select("*, profiles (full_name)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketAttachments(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_attachments")
    .select("*")
    .eq("ticket_id", ticketId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketOrganizationId(ticketId: string): Promise<string> {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("tickets")
    .select("organization_id")
    .eq("id", ticketId)
    .single();
  if (error) throw new Error(error.message);
  return data.organization_id;
}

export async function uploadTicketAttachment(
  file: File,
  orgId: string,
  ticketId: string,
  userId: string
) {
  const admin    = getAdmin();
  const ext      = file.name.split(".").pop();
  const path     = `${orgId}/${ticketId}/${userId}-${Date.now()}.${ext}`;
  const buffer   = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("ticket-attachments")
    .upload(path, buffer, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);
  const { data: urlData } = admin.storage.from("ticket-attachments").getPublicUrl(path);
  await admin.from("ticket_attachments").insert({
    ticket_id: ticketId,
    file_url:  urlData.publicUrl,
    file_name: file.name,
    file_type: file.type,
    uploaded_by: userId,
  });
}

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id, role, profiles (full_name)")
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  // Supabase infiere profiles como array por no tener tipos generados.
  // El cast via unknown es seguro: la query retorna un objeto 1-a-1 en runtime.
  return (data ?? []) as unknown as OrgMember[];
}
