import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { TicketCategory } from "../domain/category.schema";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getCategoriesByOrg(orgId: string): Promise<TicketCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_categories")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertCategory(params: {
  id?:            string | null;
  orgId:          string;
  name:           string;
  description?:   string | null;
  color?:         string;
}): Promise<string> {
  const admin = getAdmin();
  const { data, error } = await admin.rpc("upsert_ticket_category", {
    p_id:              params.id ?? null,
    p_organization_id: params.orgId,
    p_name:            params.name,
    p_description:     params.description ?? null,
    p_color:           params.color ?? "#6B7280",
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function deleteCategory(id: string, orgId: string): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin.rpc("delete_ticket_category", {
    p_id:              id,
    p_organization_id: orgId,
  });
  if (error) throw new Error(error.message);
}

export async function seedDefaultCategories(orgId: string): Promise<void> {
  const admin = getAdmin();
  await admin.rpc("seed_default_ticket_categories", { p_org_id: orgId });
}
