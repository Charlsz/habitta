import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type { Client, ClientWithStats, CreateClientInput } from '../domain/client.types';

/** Lista todos los clientes de una org con stats agregadas via RPC */
export async function getClients(organizationId: string): Promise<ClientWithStats[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.rpc('get_residents_with_stats', {
    p_org_id: organizationId,
  });
  if (error) throw error;
  return (data ?? []) as ClientWithStats[];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createSupabaseClient();
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
  return data as Client | null;
}

export async function getClientsByOrg(
  organizationId: string,
  filters?: { status?: string; assetId?: string }
): Promise<Client[]> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from('residents')
    .select(`
      *,
      assets(name, code, asset_type),
      chat_sessions(telegram_chat_id, display_name)
    `)
    .eq('organization_id', organizationId)
    .order('full_name');

  if (filters?.status)  query = query.eq('status', filters.status);
  if (filters?.assetId) query = query.eq('asset_id', filters.assetId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getClientByTelegramSession(
  telegramSessionId: string,
  organizationId: string
): Promise<Client | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('telegram_session_id', telegramSessionId)
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export async function createClientRecord(input: CreateClientInput): Promise<Client> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('residents')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClientRecord(
  id: string,
  input: Partial<CreateClientInput>
): Promise<Client> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('residents')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function deleteClientRecord(id: string): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (error) throw error;
}

/** telegram_chat_ids para broadcast segmentado */
export async function getClientChatIds(
  organizationId: string,
  segment?: { type: 'all' | 'asset' | 'floor' | 'tower'; value?: string }
): Promise<string[]> {
  const supabase = await createSupabaseClient();
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
  return (data ?? []).map((r: any) => r.chat_sessions?.telegram_chat_id).filter(Boolean) as string[];
}
