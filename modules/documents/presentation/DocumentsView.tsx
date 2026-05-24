'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Send, Download, CheckCircle, Trash2, X } from 'lucide-react';
import { HabittaSpinner } from '@/modules/core/components/HabittaSpinner';
import type { GeneratedDocument, ConfirmedData } from '../domain/document.types';

type ChatMsg =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'confirmation'; data: ConfirmedData; prompt: string }
  | { role: 'generating' }
  | { role: 'ready'; doc: GeneratedDocument };

interface Props {
  orgId: string;
  orgName: string;
  userId: string;
  initialDocs: GeneratedDocument[];
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function DocumentsView({ orgId, orgName, userId, initialDocs, supabaseUrl, supabaseAnonKey }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: `Hola 👋 Soy el asistente de documentos de **${orgName}**. Solo puedo generar documentos oficiales usando los datos reales de tu organización. ¿Qué documento necesitas?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<GeneratedDocument[]>(initialDocs);
  const [sendingDocId, setSendingDocId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<{ id: string; display_name: string | null; telegram_username: string | null }[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [activeDocForSend, setActiveDocForSend] = useState<GeneratedDocument | null>(null);
  const [orgContext, setOrgContext] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function loadData() {
      const [ctxRes, sessRes] = await Promise.all([
        fetch(`/api/documents/context?org=${orgId}`),
        fetch(`/api/documents/chat-sessions?org=${orgId}`),
      ]);
      if (ctxRes.ok) {
        const d = await ctxRes.json();
        if (d.ok) setOrgContext(d.context);
      }
      if (sessRes.ok) {
        const d = await sessRes.json();
        setChatSessions(d.sessions ?? []);
      }
    }
    loadData();
  }, [orgId]);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-document-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ action: 'confirm', prompt, organization_id: orgId, org_context: orgContext }),
      });
      const data = await res.json();

      if (data.off_topic) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? 'Solo puedo ayudarte a generar documentos oficiales de esta organización. ¿Qué documento necesitas?' }]);
        return;
      }

      if (!data.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'confirmation', data: data.confirmation, prompt }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(confirmedData: ConfirmedData, prompt: string) {
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '✅ Perfecto, generando tu documento...' },
      { role: 'generating' },
    ]);
    setLoading(true);

    try {
      const createRes = await fetch('/api/documents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, userId, title: confirmedData.title, prompt, confirmedData }),
      });
      const createData = await createRes.json();
      if (!createData.ok) throw new Error(createData.error);
      const documentId = createData.document_id;

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-document-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          confirmed_data: confirmedData,
          organization_id: orgId,
          document_id: documentId,
          user_id: userId,
          org_context: orgContext,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      const listRes = await fetch(`/api/documents/list?org=${orgId}`);
      const listData = await listRes.json();
      setDocs(listData.documents ?? []);

      const readyDoc = (listData.documents ?? []).find((d: GeneratedDocument) => d.id === documentId);
      setMessages(prev => prev.filter(m => m.role !== 'generating').concat(
        readyDoc
          ? [{ role: 'ready', doc: readyDoc }]
          : [{ role: 'assistant', content: '✅ Documento generado y guardado en la biblioteca.' }]
      ));
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.role !== 'generating').concat(
        [{ role: 'assistant', content: `❌ Error al generar: ${e.message}` }]
      ));
    } finally {
      setLoading(false);
    }
  }

  function handleReject() {
    setMessages(prev => prev.filter(m => m.role !== 'confirmation').concat(
      [{ role: 'assistant', content: 'Sin problema, dime cómo quieres el documento y lo ajusto.' }]
    ));
  }

  async function handleDelete(docId: string) {
    if (!confirm('¿Eliminar este documento?')) return;
    await fetch('/api/documents/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId }),
    });
    setDocs(prev => prev.filter(d => d.id !== docId));
  }

  async function handleSendToChat(doc: GeneratedDocument, sessionId: string) {
    setSendingDocId(doc.id);
    try {
      await fetch('/api/documents/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, sessionId, userId }),
      });
    } finally {
      setSendingDocId(null);
      setShowSendModal(false);
      setActiveDocForSend(null);
    }
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden">

      {/* LEFT: Chat */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--border)]">

        <div className="h-14 flex items-center px-5 gap-3 shrink-0 border-b border-[var(--border)]">
          <FileText className="w-4 h-4 text-[var(--foreground)]/40" />
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Asistente de Documentos</p>
            <p className="text-xs text-[var(--foreground)]/40">{orgName}</p>
          </div>
          <span className={`ml-auto text-[10px] flex items-center gap-1 ${orgContext ? 'text-emerald-500' : 'text-[var(--foreground)]/30'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${orgContext ? 'bg-emerald-400' : 'bg-[var(--foreground)]/20'}`} />
            {orgContext ? 'Datos cargados' : 'Cargando datos...'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#d4a373] text-white text-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }
            if (msg.role === 'assistant') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-[var(--surface)] text-[var(--foreground)] text-sm border border-[var(--border)]">
                    {msg.content}
                  </div>
                </div>
              );
            }
            if (msg.role === 'generating') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-sm text-[var(--foreground)]/60">
                    <HabittaSpinner size={18} />
                    Generando documento...
                  </div>
                </div>
              );
            }
            if (msg.role === 'confirmation') {
              return (
                <ConfirmationCard
                  key={i}
                  data={msg.data}
                  prompt={msg.prompt}
                  onConfirm={() => handleConfirm(msg.data, msg.prompt)}
                  onReject={handleReject}
                />
              );
            }
            if (msg.role === 'ready') {
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Documento listo: {msg.doc.title}
                    </div>
                    <div className="flex gap-2">
                      {msg.doc.pdf_url && (
                        <a
                          href={msg.doc.pdf_url}
                          download={`${msg.doc.title}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-[var(--border)] px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ej: Genera un reporte del cliente Carlos Galvis..."
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a373]/40 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-[#d4a373] text-white flex items-center justify-center hover:bg-[#c8935f] transition-colors disabled:opacity-40"
            >
              {loading ? <HabittaSpinner size={18} /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Document Library */}
      <div className="w-80 shrink-0 flex flex-col bg-[var(--sidebar-bg)]">
        <div className="h-14 flex items-center px-5 border-b border-[var(--border)] shrink-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">Biblioteca</p>
          <span className="ml-auto text-xs text-[var(--foreground)]/40">{docs.length} docs</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {docs.length === 0 && (
            <p className="text-center text-xs text-[var(--foreground)]/40 mt-8">
              Aún no hay documentos generados.
            </p>
          )}
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              sessions={chatSessions}
              sendingDocId={sendingDocId}
              onDelete={() => handleDelete(doc.id)}
              onSend={(sessionId) => handleSendToChat(doc, sessionId)}
              onOpenSendModal={() => { setActiveDocForSend(doc); setShowSendModal(true); }}
            />
          ))}
        </div>
      </div>

      {/* Send to chat modal */}
      {showSendModal && activeDocForSend && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[var(--foreground)]">Enviar a chat</p>
              <button onClick={() => setShowSendModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[var(--foreground)]/50">"{activeDocForSend.title}" — selecciona el cliente:</p>
            {chatSessions.length === 0 && (
              <p className="text-xs text-[var(--foreground)]/40 text-center py-4">No hay clientes conectados al bot de esta organización.</p>
            )}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {chatSessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSendToChat(activeDocForSend, s.id)}
                  disabled={!!sendingDocId}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--surface)] border border-[var(--border)] text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="w-7 h-7 rounded-full bg-[#d4a373]/20 flex items-center justify-center text-xs font-bold text-[#c8935f]">
                    {(s.display_name ?? s.telegram_username ?? '?')[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{s.display_name ?? s.telegram_username ?? 'Cliente'}</p>
                    {s.telegram_username && <p className="text-xs text-[var(--foreground)]/40">@{s.telegram_username}</p>}
                  </div>
                  {sendingDocId === activeDocForSend.id && <HabittaSpinner size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmationCard({ data, prompt, onConfirm, onReject }: {
  data: ConfirmedData;
  prompt: string;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-amber-200 bg-amber-50 p-4 space-y-3">
        <p className="text-sm text-[var(--foreground)]">{data.confirmation_message}</p>
        <div className="space-y-1.5 text-xs">
          <Row label="Título" value={data.title} />
          {data.recipient && <Row label="Destinatario" value={data.recipient} />}
          <Row label="Fecha" value={data.date} />
          {data.sections?.length > 0 && (
            <div className="flex gap-2">
              <span className="font-semibold text-[var(--foreground)]/50 shrink-0">Secciones</span>
              <span className="text-[var(--foreground)]/70">{data.sections.join(', ')}</span>
            </div>
          )}
          {data.extra_notes && <Row label="Notas" value={data.extra_notes} />}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 rounded-xl bg-[#d4a373] text-white text-xs font-semibold hover:bg-[#c8935f] transition-colors"
          >
            ✅ Confirmar y generar
          </button>
          <button
            onClick={onReject}
            className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)]/60 hover:bg-[var(--surface)] transition-colors"
          >
            Ajustar
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-semibold text-[var(--foreground)]/50 shrink-0">{label}</span>
      <span className="text-[var(--foreground)]/70">{value}</span>
    </div>
  );
}

function DocCard({ doc, sessions, sendingDocId, onDelete, onSend, onOpenSendModal }: {
  doc: GeneratedDocument;
  sessions: { id: string; display_name: string | null; telegram_username: string | null }[];
  sendingDocId: string | null;
  onDelete: () => void;
  onSend: (sessionId: string) => void;
  onOpenSendModal: () => void;
}) {
  const statusColor = doc.status === 'ready' ? 'bg-emerald-400' : doc.status === 'generating' ? 'bg-amber-400 animate-pulse' : 'bg-[var(--foreground)]/20';

  return (
    <div className="habitta-card p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--foreground)] truncate">{doc.title}</p>
          <p className="text-[10px] text-[var(--foreground)]/40">
            {new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button onClick={onDelete} className="shrink-0 text-[var(--foreground)]/20 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {doc.status === 'ready' && (
        <div className="flex gap-1.5">
          {doc.pdf_url ? (
            <a
              href={doc.pdf_url}
              download={`${doc.title}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[10px] font-medium hover:bg-white transition-colors"
            >
              <Download className="w-3 h-3" />
              Descargar
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[10px] text-[var(--foreground)]/30">
              Sin PDF
            </span>
          )}
          <button
            onClick={onOpenSendModal}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[10px] font-medium hover:bg-white transition-colors"
          >
            <Send className="w-3 h-3" />
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
