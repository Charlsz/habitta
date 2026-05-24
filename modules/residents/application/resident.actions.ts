'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireOrgRole } from '@/modules/auth/application/auth.guard';
import {
  createResident,
  deleteResident,
  updateResident,
} from '../infrastructure/resident.repository';
import type { CreateResidentInput } from '../domain/resident.types';

export async function createResidentAction(formData: FormData) {
  const user = await requireAuth();
  const organizationId = formData.get('organization_id') as string;
  await requireOrgRole(user.id, organizationId, ['admin', 'owner']);

  const input: CreateResidentInput = {
    organization_id: organizationId,
    full_name: (formData.get('full_name') as string).trim(),
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    document_type: (formData.get('document_type') as string) || null,
    document_number: (formData.get('document_number') as string) || null,
    asset_id: (formData.get('asset_id') as string) || null,
    telegram_session_id: (formData.get('telegram_session_id') as string) || null,
    relation_type: (formData.get('relation_type') as any) || 'resident',
    move_in_date: (formData.get('move_in_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
    metadata: {
      tower: (formData.get('tower') as string) || undefined,
      floor: (formData.get('floor') as string) || undefined,
      unit: (formData.get('unit') as string) || undefined,
      parking: (formData.get('parking') as string) || undefined,
    },
  };

  await createResident(input);
  revalidatePath(`/residents`);
  revalidatePath(`/dashboard`);
}

export async function updateResidentAction(id: string, formData: FormData) {
  const user = await requireAuth();
  const organizationId = formData.get('organization_id') as string;
  await requireOrgRole(user.id, organizationId, ['admin', 'owner']);

  const input: Partial<CreateResidentInput> = {
    full_name: (formData.get('full_name') as string)?.trim(),
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    document_type: (formData.get('document_type') as string) || null,
    document_number: (formData.get('document_number') as string) || null,
    asset_id: (formData.get('asset_id') as string) || null,
    relation_type: (formData.get('relation_type') as any) || 'resident',
    move_in_date: (formData.get('move_in_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
    metadata: {
      tower: (formData.get('tower') as string) || undefined,
      floor: (formData.get('floor') as string) || undefined,
      unit: (formData.get('unit') as string) || undefined,
      parking: (formData.get('parking') as string) || undefined,
    },
  };

  await updateResident(id, input);
  revalidatePath(`/residents`);
  revalidatePath(`/residents/${id}`);
}

export async function deleteResidentAction(id: string, organizationId: string) {
  const user = await requireAuth();
  await requireOrgRole(user.id, organizationId, ['admin', 'owner']);
  await deleteResident(id);
  revalidatePath(`/residents`);
  revalidatePath(`/dashboard`);
}
