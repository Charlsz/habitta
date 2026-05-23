import { createClient } from "@/modules/core/infrastructure/supabase/server";
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

export async function createOrganization(org: OrganizationInsert, userId: string): Promise<Organization> {
  const supabase = await createClient();

  // Insertar la organización
  const { data: newOrg, error: orgError } = await supabase
    .from("organizations")
    .insert([{ name: org.name, type: org.type }])
    .select()
    .single();

  if (orgError) throw new Error(orgError.message);

  // Auto-asignar el creador como 'owner'
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert([{ organization_id: newOrg.id, user_id: userId, role: "owner" }]);

  if (memberError) throw new Error(memberError.message);

  return newOrg as Organization;
}
