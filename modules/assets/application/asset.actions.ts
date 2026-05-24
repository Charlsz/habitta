'use server';

import { revalidatePath } from 'next/cache';
import { requireOrgRole } from '@/modules/auth/application/auth.guard';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Crea una nueva unidad (apartamento, local, parqueadero, etc.) */
export async function createAssetAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const orgId = formData.get('organization_id') as string;
  if (!orgId) return { error: 'Organización requerida' };

  try {
    await requireOrgRole(orgId, ['admin', 'owner']);
    const admin = getAdmin();

    const { error } = await admin.from('assets').insert({
      organization_id: orgId,
      name:       (formData.get('name') as string).trim(),
      code:       (formData.get('code') as string) || null,
      asset_type: (formData.get('asset_type') as string) || 'unit',
      location:   (formData.get('location') as string) || null,
      description:(formData.get('description') as string) || null,
      status:     'available',
    });

    if (error) throw new Error(error.message);
    revalidatePath('/clients');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al crear la unidad' };
  }
}

/** Actualiza una unidad existente */
export async function updateAssetAction(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const orgId = formData.get('organization_id') as string;
  if (!orgId) return { error: 'Organización requerida' };

  try {
    await requireOrgRole(orgId, ['admin', 'owner']);
    const admin = getAdmin();

    const { error } = await admin.from('assets').update({
      name:       (formData.get('name') as string).trim(),
      code:       (formData.get('code') as string) || null,
      asset_type: (formData.get('asset_type') as string) || 'unit',
      location:   (formData.get('location') as string) || null,
      description:(formData.get('description') as string) || null,
    }).eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/clients');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al actualizar la unidad' };
  }
}

/** Elimina una unidad (solo si no tiene clientes activos asignados) */
export async function deleteAssetAction(
  id: string,
  orgId: string
): Promise<{ error?: string }> {
  try {
    await requireOrgRole(orgId, ['admin', 'owner']);
    const admin = getAdmin();
    const { error } = await admin.from('assets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/clients');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al eliminar la unidad' };
  }
}
