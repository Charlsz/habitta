import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest) {
  try {
    const { documentId } = await req.json();
    const supabase = await createClient();
    // Get path first for storage cleanup
    const { data: doc } = await supabase
      .from('generated_documents')
      .select('pdf_path')
      .eq('id', documentId)
      .single();
    if (doc?.pdf_path) {
      await supabase.storage.from('org-documents').remove([doc.pdf_path]);
    }
    await supabase.from('generated_documents').delete().eq('id', documentId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
