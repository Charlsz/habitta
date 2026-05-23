import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Organization, OrganizationInsert } from "../domain/organization.schema";

export async function getOrganizations(userId: string): Promise<Organization[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select(`
      *,
      organization_members!inner(user_id)
    `)
    .eq("organization_members.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Organization[];
}

export async function getOrganizationById(id: string): Promise<Organization> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Organization;
}

export async function createOrganization(
  org: OrganizationInsert,
  userId: string
): Promise<Organization> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Configuracion de Supabase incompleta. Falta SUPABASE_SERVICE_ROLE_KEY.");
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.rpc("create_organization_for_user", {
    p_name:             org.name,
    p_type:             org.type,
    p_user_id:          userId,
    p_address:          org.address          || null,
    p_city:             org.city             || null,
    p_phone:            org.phone            || null,
    p_email:            org.email            || null,
    p_other_type_label: org.other_type_label || null,
  });

  if (error) throw new Error(error.message);
  return data as Organization;
}
