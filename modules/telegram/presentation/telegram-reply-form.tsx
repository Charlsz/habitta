"use client";

import { useRef, useState, useTransition } from "react";
import { sendTelegramReplyAction } from "@/modules/telegram/application/telegram.actions";

interface Props {
  ticketId: string;
  residentName: string;
  residentUsername?: string | null;
}

export function TelegramReplyForm({ ticketId, residentName, residentUsername }: Props) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await sendTelegramReplyAction(formData);
        setSent(true);
        if (textareaRef.current) textareaRef.current.value = "";
        setTimeout(() => setSent(false), 3000);
      } catch (err: any) {
        setError(err?.message ?? "Error enviando el mensaje");
      }
    });
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📲</span>
        <div>
          <p className="font-semibold text-blue-900 text-sm">Responder por Telegram</p>
          <p className="text-xs text-blue-600 mt-0.5">
            El mensaje le llegará a{" "}
            <span className="font-semibold">{residentName}</span>
            {residentUsername && (
              <span className="text-blue-400"> (@{residentUsername})</span>
            )}{" "}
            directamente en Telegram.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="ticket_id" value={ticketId} />
        <textarea
          ref={textareaRef}
          name="message"
          required
          rows={3}
          placeholder="Escribe tu mensaje para el residente..."
          className="w-full text-sm border border-blue-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ❌ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`text-sm px-5 py-2 rounded-lg font-medium transition-all ${
            sent
              ? "bg-green-500 text-white"
              : isPending
              ? "bg-blue-300 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {sent ? "✓ Enviado" : isPending ? "Enviando..." : "📤 Enviar por Telegram"}
        </button>
      </form>
    </div>
  );
}
