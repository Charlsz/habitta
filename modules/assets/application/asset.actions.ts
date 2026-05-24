'use server';

import { revalidatePath } from 'next/cache';
import { requireOrgRole } from '@/modules/auth/application/auth.guard';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { AssetInsert } from '../domain/asset.schema';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Crea un activo usando la RPC existente.
 * Mantiene la firma original (AssetInsert) para no romper asset-form.tsx.
 */
export async function createAssetAction(
  data: AssetInsert
): Promise<{ error?: string }> {
  try {
    const user  = await requireAuth();
    const admin = getAdmin();

    const { error } = await admin.rpc('create_asset_for_user', {
      p_organization_id: data.organization_id,
      p_name:            data.name,
      p_asset_type:      data.asset_type  || 'other',
      p_description:     data.description || null,
      p_location:        data.location    || null,
      p_status:          data.status      || 'active',
      p_code:            data.code        || null,
      p_metadata:        data.metadata    || null,
      p_creator_id:      user.id,
    });

    if (error) throw new Error(error.message);
    revalidatePath('/clients');
    revalidatePath('/assets');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al crear la unidad' };
  }
}

/** Actualiza nombre, tipo, código, ubicación y descripción de un activo. */
export async function updateAssetAction(
  id: string,
  orgId: string,
  fields: {
    name: string;
    code?: string | null;
    asset_type: string;
    location?: string | null;
    description?: string | null;
  }
): Promise<{ error?: string }> {
  try {
    await requireOrgRole(orgId, ['admin', 'owner']);
    const admin = getAdmin();

    const { error } = await admin
      .from('assets')
      .update({
        name:        fields.name.trim(),
        code:        fields.code        || null,
        asset_type:  fields.asset_type  || 'unit',
        location:    fields.location    || null,
        description: fields.description || null,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/clients');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al actualizar la unidad' };
  }
}

/** Elimina un activo (solo si no tiene restricciones FK activas). */
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
