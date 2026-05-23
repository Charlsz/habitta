import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { redirect } from "next/navigation";

/**
 * Verifica si hay un usuario autenticado. 
 * Si no lo hay, redirige al login.
 * @returns El usuario de Supabase
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

/**
 * Valida el acceso de un usuario basado en su rol dentro de una organización.
 * Mantiene la lógica de permisos puramente en el servidor.
 * 
 * @param organizationId UUID de la organización
 * @param allowedRoles Roles permitidos ('owner', 'admin', 'member')
 */
export async function requireOrgRole(organizationId: string, allowedRoles: ("owner" | "admin" | "member")[]) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single();

  if (error || !member || !allowedRoles.includes(member.role)) {
    // Podrías renderizar una página 403 modificando el return o redirigiendo
    redirect("/dashboard?error=unauthorized"); 
  }

  return { user, role: member.role };
}
