"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { usePathname } from "next/navigation";
import { askAIAssistant, getOrganizationAIContext } from "@/modules/dashboard/application/ai-assistant.actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  initialContext: any;
}

function getOrgIdFromURL(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("org") ?? undefined;
}

export function AIAssistantButton({ initialContext }: Props) {
  const [open, setOpen]             = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [context, setContext]       = useState<any>(initialContext);
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const trackedOrgId = useRef<string | undefined>(context?.orgId);

  // Detect if we're on the documents page — hide the bubble there
  const pathname = usePathname();
  const isDocumentsPage = pathname === "/documents";

  // ── Carga contexto para un orgId concreto ───────────────────────────────
  const loadContext = useCallback(async (orgId?: string, announce = false) => {
    setLoadingCtx(true);
    try {
      const fresh = await getOrganizationAIContext(orgId);
      if (!fresh) return;
      setContext(fresh);
      trackedOrgId.current = fresh.orgId;
      if (announce) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🔄 Contexto actualizado: ahora analizo **${fresh.org?.name}**. Puedes seguir preguntando.`,
          },
        ]);
      }
    } finally {
      setLoadingCtx(false);
    }
  }, []);

  // ── Al abrir: carga contexto y saludo ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 100);

    const urlOrgId = getOrgIdFromURL();
    if (urlOrgId !== trackedOrgId.current) {
      loadContext(urlOrgId, messages.length > 0);
    } else if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `¡Hola! Soy tu asistente de análisis para **${
            context?.org?.name ?? "tu organización"
          }**. Puedo responder preguntas sobre clientes, tickets, agenda y más. ¿En qué te puedo ayudar?`,
        },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Polling: detecta cambio de ?org= mientras el panel está abierto ──────
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      const urlOrgId = getOrgIdFromURL();
      if (urlOrgId && urlOrgId !== trackedOrgId.current) {
        loadContext(urlOrgId, true);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [open, loadContext]);

  // ── Scroll automático ────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  // ── Enviar mensaje ───────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text || isPending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      try {
        const reply = await askAIAssistant(
          newMessages.map((m) => ({ role: m.role, content: m.content })),
          context
        );
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Ocurrió un error. Intenta de nuevo." },
        ]);
      }
    });
  };

  // En /documents la burbuja no se renderiza visualmente,
  // pero el componente sigue montado y el contexto sigue vivo.
  if (isDocumentsPage) return null;

  return (
    <>
      {/* Botón flotante */}
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
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">

          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-2 shrink-0"
            style={{ backgroundColor: "#d4a373" }}
          >
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
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
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
            ))}

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
              placeholder="Pregunta sobre clientes, tickets, agenda…"
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
