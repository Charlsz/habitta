import { createClient } from '@/lib/supabase/server';
import type { CreateResidentInput, Resident, ResidentWithStats } from '../domain/resident.types';

export async function getResidents(organizationId: string): Promise<ResidentWithStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_residents_with_stats', {
    p_org_id: organizationId,
  });
  if (error) throw error;
  return (data ?? []) as ResidentWithStats[];
}

export async function getResidentById(id: string): Promise<Resident | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('residents')
    .select(`
      *,
      assets(name, code, asset_type, location),
      chat_sessions(telegram_chat_id, display_name, telegram_username)
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Resident | null;
}

export async function getResidentByTelegramSession(
  telegramSessionId: string,
  organizationId: string
): Promise<Resident | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('telegram_session_id', telegramSessionId)
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (error) throw error;
  return data as Resident | null;
}

export async function createResident(input: CreateResidentInput): Promise<Resident> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('residents')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Resident;
}

export async function updateResident(
  id: string,
  input: Partial<CreateResidentInput>
): Promise<Resident> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('residents')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Resident;
}

export async function deleteResident(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (error) throw error;
}

/** Retorna los telegram_chat_ids de residentes activos, opcionalmente filtrados por segmento */
export async function getResidentChatIds(
  organizationId: string,
  segment?: { type: 'all' | 'asset' | 'floor' | 'tower'; value?: string }
): Promise<string[]> {
  const supabase = await createClient();
  let query = supabase
    .from('residents')
    .select('chat_sessions(telegram_chat_id)')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .not('telegram_session_id', 'is', null);

  if (segment?.type === 'asset' && segment.value) {
    query = query.eq('asset_id', segment.value);
  } else if (segment?.type === 'floor' && segment.value) {
    query = query.contains('metadata', { floor: segment.value });
  } else if (segment?.type === 'tower' && segment.value) {
    query = query.contains('metadata', { tower: segment.value });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((r: any) => r.chat_sessions?.telegram_chat_id)
    .filter(Boolean) as string[];
}

/** Preview dry-run de chat_sessions que podrían importarse como residents */
export async function previewChatSessionsToResidents(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('preview_chat_sessions_to_residents', {
    p_org_id: organizationId,
  });
  if (error) throw error;
  return data ?? [];
}
