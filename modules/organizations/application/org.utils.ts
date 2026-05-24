import { createClient } from '@/lib/supabase/server';

/**
 * Retorna el org activo dado el ?org= de la URL.
 * Si no se pasa, devuelve la primera org del usuario.
 * Centraliza la lógica que estaba duplicada en múltiples actions.
 */
export async function getActiveOrganizationId(
  userId: string,
  orgIdFromUrl?: string
): Promise<string> {
  const supabase = await createClient();

  if (orgIdFromUrl) {
    // Verificar que el usuario pertenece a esa org
    const { data } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .eq('organization_id', orgIdFromUrl)
      .maybeSingle();
    if (data) return data.organization_id;
  }

  // Fallback: primera org del usuario
  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (!data) throw new Error('El usuario no pertenece a ninguna organización');
  return data.organization_id;
}
