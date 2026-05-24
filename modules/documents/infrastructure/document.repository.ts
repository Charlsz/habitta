import { createClient } from '@/lib/supabase/server';
import type { GeneratedDocument } from '../domain/document.types';

export async function getDocumentsByOrg(orgId: string): Promise<GeneratedDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('generated_documents')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as GeneratedDocument[];
}

export async function createDocumentRecord(params: {
  organization_id: string;
  created_by: string;
  title: string;
  prompt: string;
  confirmed_data: object;
  content: string;
}): Promise<GeneratedDocument> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('generated_documents')
    .insert({ ...params, status: 'generating' })
    .select()
    .single();
  if (error) throw error;
  return data as GeneratedDocument;
}

export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('generated_documents')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
