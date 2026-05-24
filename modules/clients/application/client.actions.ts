'use server';

import { revalidatePath } from 'next/cache';
import { requireOrgRole } from '@/modules/auth/application/auth.guard';
import { createClientRecord, updateClientRecord, deleteClientRecord } from '../infrastructure/client.repository';
import type { CreateClientInput, ClientRelationType, DocumentType } from '../domain/client.types';

function buildMetadata(formData: FormData) {
  const tower   = (formData.get('tower')   as string) || undefined;
  const floor   = (formData.get('floor')   as string) || undefined;
  const unit    = (formData.get('unit')    as string) || undefined;
  const parking = (formData.get('parking') as string) || undefined;
  if (!tower && !floor && !unit && !parking) return {};
  return { tower, floor, unit, parking };
}

export async function createClientAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const organizationId = formData.get('organization_id') as string;
  if (!organizationId) return { error: 'Organización requerida' };

  try {
    await requireOrgRole(organizationId, ['admin', 'owner']);

    const input: CreateClientInput = {
      organization_id:     organizationId,
      full_name:           (formData.get('full_name') as string).trim(),
      email:               (formData.get('email')          as string) || null,
      phone:               (formData.get('phone')          as string) || null,
      document_type:       (formData.get('document_type')  as DocumentType) || null,
      document_number:     (formData.get('document_number') as string) || null,
      asset_id:            (formData.get('asset_id')        as string) || null,
      telegram_session_id: (formData.get('telegram_session_id') as string) || null,
      relation_type:       (formData.get('relation_type')   as ClientRelationType) || 'resident',
      move_in_date:        (formData.get('move_in_date')    as string) || null,
      notes:               (formData.get('notes')           as string) || null,
      metadata:            buildMetadata(formData),
    };

    await createClientRecord(input);
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al crear el cliente' };
  }
}

export async function updateClientAction(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const organizationId = formData.get('organization_id') as string;
  if (!organizationId) return { error: 'Organización requerida' };

  try {
    await requireOrgRole(organizationId, ['admin', 'owner']);

    const input: Partial<CreateClientInput> = {
      full_name:       (formData.get('full_name')      as string)?.trim(),
      email:           (formData.get('email')          as string) || null,
      phone:           (formData.get('phone')          as string) || null,
      document_type:   (formData.get('document_type')  as DocumentType) || null,
      document_number: (formData.get('document_number') as string) || null,
      asset_id:        (formData.get('asset_id')        as string) || null,
      relation_type:   (formData.get('relation_type')   as ClientRelationType) || 'resident',
      move_in_date:    (formData.get('move_in_date')    as string) || null,
      move_out_date:   (formData.get('move_out_date')   as string) || null,
      notes:           (formData.get('notes')           as string) || null,
      metadata:        buildMetadata(formData),
    };

    await updateClientRecord(id, input);
    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al actualizar el cliente' };
  }
}

export async function deleteClientAction(
  id: string,
  organizationId: string
): Promise<{ error?: string }> {
  try {
    await requireOrgRole(organizationId, ['admin', 'owner']);
    await deleteClientRecord(id);
    revalidatePath('/clients');
    return {};
  } catch (e: any) {
    return { error: e?.message ?? 'Error al eliminar el cliente' };
  }
}
