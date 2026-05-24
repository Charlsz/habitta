import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org');
  if (!orgId) return NextResponse.json({ documents: [] });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ documents: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ documents: [], error: e.message });
  }
}
