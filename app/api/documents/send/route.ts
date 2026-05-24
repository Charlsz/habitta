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
      .select('title, content, pdf_url')
      .eq('id', documentId)
      .single();

    // Get chat session
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('telegram_chat_id')
      .eq('id', sessionId)
      .single();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (session?.telegram_chat_id && botToken && doc) {
      const chatId = session.telegram_chat_id;

      if (doc.pdf_url) {
        // ── Send as real PDF file ──────────────────────────────────────
        // Download the PDF from Storage first
        const pdfRes = await fetch(doc.pdf_url);
        if (pdfRes.ok) {
          const pdfBuffer = await pdfRes.arrayBuffer();
          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

          const form = new FormData();
          form.append('chat_id', String(chatId));
          form.append('caption', `📄 *${doc.title}*\n_Enviado desde Habitta_`);
          form.append('parse_mode', 'Markdown');
          form.append('document', blob, `${doc.title}.pdf`);

          await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: form,
          });
        } else {
          // PDF download failed, fallback to link
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `📄 *${doc.title}*\n\n[📥 Descargar PDF](${doc.pdf_url})`,
              parse_mode: 'Markdown',
            }),
          });
        }
      } else if (doc.content) {
        // ── Fallback: send text (old docs without PDF) ────────────────────
        const header = `📄 *${doc.title}*\n${'\u2500'.repeat(28)}\n\n`;
        const maxLen = 4096 - header.length;
        // Strip markdown-like symbols to send as clean text
        const cleanContent = doc.content
          .replace(/={3,}/g, '\u2500'.repeat(28))
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .slice(0, maxLen);

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: header + cleanContent,
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
