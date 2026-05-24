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

    // Get document details (including content as fallback)
    const { data: doc } = await supabase
      .from('generated_documents')
      .select('title, content, pdf_url')
      .eq('id', documentId)
      .single();

    // Get chat session details
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('telegram_chat_id')
      .eq('id', sessionId)
      .single();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (session?.telegram_chat_id && botToken && doc) {
      if (doc.pdf_url) {
        // Send as link
        const msg = `📄 *${doc.title}*\n\n[📥 Descargar documento](${doc.pdf_url})`;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: session.telegram_chat_id,
            text: msg,
            parse_mode: 'Markdown',
          }),
        });
      } else if (doc.content) {
        // Fallback: send content as text (Telegram max 4096 chars)
        const header = `📄 *${doc.title}*\n${'─'.repeat(30)}\n\n`;
        const body = doc.content.slice(0, 4096 - header.length);
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: session.telegram_chat_id,
            text: header + body,
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
