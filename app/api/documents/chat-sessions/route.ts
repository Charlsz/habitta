import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org');
  if (!orgId) return NextResponse.json({ sessions: [] });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, display_name, telegram_username')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ sessions: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ sessions: [], error: e.message });
  }
}
