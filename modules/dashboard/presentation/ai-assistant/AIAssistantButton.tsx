"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { askAIAssistant } from "@/modules/dashboard/application/ai-assistant.actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  context: any;
}

export function AIAssistantButton({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: `¡Hola! Soy tu asistente de análisis para **${context?.org?.name ?? "tu organización"}**. Puedo responder preguntas sobre tus tickets, prioridades y operaciones. ¿En qué te puedo ayudar?`,
          },
        ]);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

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

      {/* Panel slide-over */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-2 shrink-0"
            style={{ backgroundColor: "#d4a373" }}
          >
            <span className="text-white text-lg">✦</span>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Asistente Habitta</p>
              <p className="text-white/80 text-xs">{context?.org?.name ?? "Tu organización"}</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-[var(--sidebar-bg)] text-[var(--foreground)] rounded-bl-sm border border-[var(--border)]"
                  }`}
                  style={
                    msg.role === "user" ? { backgroundColor: "#d4a373" } : {}
                  }
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
              placeholder="Pregunta sobre tus tickets..."
              disabled={isPending}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[#d4a373] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isPending || !input.trim()}
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
