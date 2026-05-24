import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { orgId, userId, title, prompt, confirmedData } = await req.json();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        organization_id: orgId,
        created_by: userId,
        title,
        prompt,
        confirmed_data: confirmedData,
        content: '',
        status: 'generating',
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, document_id: data.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
