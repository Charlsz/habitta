"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Undo2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  askAIAssistant,
  getOrganizationAIContext,
  executeAIAction,
  type AIActionResponse,
  type AIOperation,
} from "@/modules/dashboard/application/ai-assistant.actions";
import { setAIBridgeInstruction } from "@/lib/ai-bridge";

// ── Types ───────────────────────────────────────────────────────────────────────────────
type AnswerMsg     = { role: "user" | "assistant"; content: string };
type ActionMsg     = { role: "action_pending"; action: AIActionResponse };
type ActionDoneMsg = { role: "action_done"; description: string; undoIndex: number };
type Message = AnswerMsg | ActionMsg | ActionDoneMsg;

type UndoEntry = { description: string; operations: AIOperation[] };

interface Props { initialContext: any; }

function getOrgIdFromURL(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("org") ?? undefined;
}

// ── Component ─────────────────────────────────────────────────────────────────────────────
export function AIAssistantButton({ initialContext }: Props) {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [context, setContext]         = useState<any>(initialContext);
  const [loadingCtx, setLoadingCtx]   = useState(false);
  const [undoStack, setUndoStack]     = useState<UndoEntry[]>([]);
  const [undoing, setUndoing]         = useState(false);
  const [isPending, startTransition]  = useTransition();
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const trackedOrgId = useRef<string | undefined>(context?.orgId);

  const pathname = usePathname();
  const router   = useRouter();
  const isDocumentsPage = pathname === "/documents";

  // ── Load context ────────────────────────────────────────────────────────────────────
  const loadContext = useCallback(async (orgId?: string, announce = false) => {
    setLoadingCtx(true);
    try {
      const fresh = await getOrganizationAIContext(orgId);
      if (!fresh) return;
      setContext(fresh);
      trackedOrgId.current = fresh.orgId;
      if (announce) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `🔄 Contexto actualizado: ahora analizo **${fresh.org?.name}**. Puedes seguir.`,
        }]);
      }
    } finally {
      setLoadingCtx(false);
    }
  }, []);

  // ── On open ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 100);
    const urlOrgId = getOrgIdFromURL();
    if (urlOrgId !== trackedOrgId.current) {
      loadContext(urlOrgId, messages.length > 0);
    } else if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `¡Hola! Soy tu asistente para **${context?.org?.name ?? "tu organización"}**. Puedo responder preguntas, ejecutar cambios (tickets, residentes, etc.) y también pedirle al asistente de documentos que genere PDFs. ¿En qué te ayudo?`,
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Poll for org change ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      const urlOrgId = getOrgIdFromURL();
      if (urlOrgId && urlOrgId !== trackedOrgId.current) loadContext(urlOrgId, true);
    }, 1500);
    return () => clearInterval(interval);
  }, [open, loadContext]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  // ── Send message ───────────────────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text || isPending) return;

    const conversationHistory = messages
      .filter((m): m is AnswerMsg => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const newHistory = [...conversationHistory, { role: "user" as const, content: text }];
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    startTransition(async () => {
      try {
        const reply = await askAIAssistant(newHistory, context);

        if (reply.type === "navigate_documents") {
          // Bridge: send instruction to documents chat and navigate
          const orgId = context?.orgId;
          if (orgId) {
            setAIBridgeInstruction({
              instruction: (reply as any).instruction,
              orgId,
              target: "documents",
            });
            setMessages((prev) => [...prev, {
              role: "assistant",
              content: `📄 Listo, te llevo a Documentos para generar: **${(reply as any).instruction}**`,
            }]);
            setTimeout(() => {
              router.push(`/documents?org=${orgId}`);
              setOpen(false);
            }, 800);
          }
        } else if (reply.type === "action") {
          setMessages((prev) => [...prev, { role: "action_pending", action: reply }]);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: reply.content }]);
        }
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "❌ Ocurrió un error. Intenta de nuevo." }]);
      }
    });
  };

  // ── Confirm action ───────────────────────────────────────────────────────────────────
  const handleConfirmAction = async (action: AIActionResponse) => {
    const orgId = context?.orgId;
    if (!orgId) return;

    setMessages((prev) => prev.map((m) =>
      m.role === "action_pending" ? { role: "assistant" as const, content: "⏳ Ejecutando cambios..." } : m
    ));

    const result = await executeAIAction(action.operations, orgId);

    if (result.ok) {
      const undoIndex = undoStack.length;
      setUndoStack((prev) => [...prev, { description: action.description, operations: action.undo_operations }]);
      await loadContext(orgId, false);
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === "assistant" && (m as AnswerMsg).content === "⏳ Ejecutando cambios...")),
        { role: "action_done", description: action.description, undoIndex },
      ]);
    } else {
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === "assistant" && (m as AnswerMsg).content === "⏳ Ejecutando cambios...")),
        { role: "assistant", content: `❌ Error al ejecutar: ${result.error}` },
      ]);
    }
  };

  // ── Cancel action ───────────────────────────────────────────────────────────────────
  const handleCancelAction = () => {
    setMessages((prev) => [
      ...prev.filter((m) => m.role !== "action_pending"),
      { role: "assistant", content: "Acción cancelada. ¿Qué más necesitas?" },
    ]);
  };

  // ── Undo ─────────────────────────────────────────────────────────────────────────────────
  const handleUndo = async () => {
    if (undoStack.length === 0 || undoing) return;
    const last = undoStack[undoStack.length - 1];
    setUndoing(true);
    const orgId = context?.orgId;
    if (!orgId) { setUndoing(false); return; }

    const result = await executeAIAction(last.operations, orgId);
    setUndoing(false);

    if (result.ok) {
      setUndoStack((prev) => prev.slice(0, -1));
      await loadContext(orgId, false);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `↩️ Cambio revertido: "${last.description}"`,
      }]);
    } else {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `❌ No se pudo revertir: ${result.error}`,
      }]);
    }
  };

  if (isDocumentsPage) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#d4a373" }}
        title="Asistente IA"
        aria-label="Abrir asistente IA"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 shrink-0" style={{ backgroundColor: "#d4a373" }}>
            <span className="text-white text-lg">✦</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Asistente Habitta</p>
              <p className="text-white/80 text-xs truncate">
                {loadingCtx ? "Actualizando contexto…" : (context?.org?.name ?? "Tu organización")}
              </p>
            </div>
            {loadingCtx && (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
            )}
            {undoStack.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={undoing}
                title={`Revertir: "${undoStack[undoStack.length - 1]?.description}"`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium disabled:opacity-50"
              >
                {undoing
                  ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Undo2 className="w-3.5 h-3.5" />}
                Revertir
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => {
              if (msg.role === "user" || msg.role === "assistant") {
                return (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-[var(--sidebar-bg)] text-[var(--foreground)] rounded-bl-sm border border-[var(--border)]"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: "#d4a373" } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.role === "action_pending") {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-amber-300 bg-amber-50 p-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800">Acción pendiente de confirmación</p>
                          <p className="text-xs text-amber-700 mt-0.5">{msg.action.confirmation_message}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmAction(msg.action)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirmar
                        </button>
                        <button
                          onClick={handleCancelAction}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.role === "action_done") {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        <span className="font-semibold">Hecho:</span> {msg.description}
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {isPending && (
              <div className="flex justify-start">
                <div className="bg-[var(--sidebar-bg)] border border-[var(--border)] px-4 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[var(--border)] shrink-0 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pregunta, pide un cambio o genera un documento..."
              disabled={isPending || loadingCtx}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[#d4a373] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isPending || !input.trim() || loadingCtx}
              className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#d4a373" }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
