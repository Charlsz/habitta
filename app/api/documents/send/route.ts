import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { documentId, sessionId, userId } = await req.json();
    const supabase = await createClient();

    // Register the send
    await supabase.from('document_sends').insert({
      document_id: documentId,
      chat_session_id: sessionId,
      sent_by: userId,
    });

    // Get document details
    const { data: doc } = await supabase
      .from('generated_documents')
      .select('title, pdf_url')
      .eq('id', documentId)
      .single();

    // Get chat session details
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('telegram_chat_id')
      .eq('id', sessionId)
      .single();

    // Send via Telegram if we have chat_id and pdf_url
    if (session?.telegram_chat_id && doc?.pdf_url) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        const msg = `📄 *Documento: ${doc.title}*\n\n[Descargar documento](${doc.pdf_url})`;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: session.telegram_chat_id,
            text: msg,
            parse_mode: 'Markdown',
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
