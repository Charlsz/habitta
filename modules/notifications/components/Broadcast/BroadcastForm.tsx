"use client";

import { useState, useTransition } from "react";
import { sendBroadcastAction } from "@/modules/notifications/application/broadcast.actions";
import { BroadcastConfirmModal } from "./BroadcastConfirmModal";
import { BroadcastPreview } from "./BroadcastPreview";

const CATEGORIES = [
  { value: "announcement", label: "📢 Comunicado",    header: "📢 *Comunicado*" },
  { value: "maintenance",  label: "🔧 Mantenimiento", header: "🔧 *Mantenimiento*" },
  { value: "services",     label: "💧 Servicios",     header: "💧 *Servicios*" },
  { value: "emergency",    label: "🚨 Emergencia",    header: "🚨 *EMERGENCIA*" },
];

const MAX_CHARS = 500;

interface Props {
  orgId: string;
  recipientCount: number;
}

export function BroadcastForm({ orgId, recipientCount }: Props) {
  const [message, setMessage]       = useState("");
  const [category, setCategory]     = useState("announcement");
  const [showModal, setShowModal]   = useState(false);
  const [result, setResult]         = useState<{ sent: number; failed: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = MAX_CHARS - message.length;
  const canSend   = message.trim().length >= 5 && recipientCount > 0;
  const selectedCat = CATEGORIES.find((c) => c.value === category)!;

  function handleSend() {
    startTransition(async () => {
      setShowModal(false);
      setResult(null);
      const res = await sendBroadcastAction(orgId, message, category);
      setResult({ sent: res.sent, failed: res.failed });
      if (res.sent > 0) setMessage("");
    });
  }

  return (
    <div className="space-y-6">
      {/* Selector de categoría */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
          Categoría
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                category === cat.value
                  ? "bg-[#d4a373] text-white border-[#d4a373]"
                  : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:border-[#d4a373]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
          Mensaje
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
          rows={5}
          placeholder="Escribe el mensaje que recibirán todos los residentes conectados por Telegram..."
          className="w-full text-sm border border-[var(--border)] p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#d4a373] bg-white resize-none"
        />
        <div className={`text-xs mt-1 text-right ${
          remaining < 50 ? "text-red-500" : "text-[var(--muted)]"
        }`}>
          {remaining} caracteres restantes
        </div>
      </div>

      {/* Preview + Botón */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <BroadcastPreview message={message} categoryHeader={selectedCat.header} />

        <div className="space-y-4">
          {recipientCount === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)] text-center">
              No hay residentes conectados por Telegram en esta organización.
            </div>
          ) : (
            <div className="habitta-card p-4 flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-bold text-lg">{recipientCount}</p>
                <p className="text-xs text-[var(--muted)]">residente{recipientCount !== 1 ? "s" : ""} recibirán el mensaje</p>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!canSend || isPending}
            onClick={() => setShowModal(true)}
            className="w-full bg-[#d4a373] hover:bg-[#c8935f] disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {isPending ? "Enviando..." : `📤 Enviar a ${recipientCount} residente${recipientCount !== 1 ? "s" : ""}`}
          </button>

          {/* Resultado */}
          {result && (
            <div className={`rounded-lg p-4 text-sm font-medium ${
              result.sent > 0
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {result.sent > 0 && `✅ Enviado a ${result.sent} residente${result.sent !== 1 ? "s" : ""}`}
              {result.failed > 0 && ` · ⚠️ ${result.failed} fallido${result.failed !== 1 ? "s" : ""}`}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <BroadcastConfirmModal
          recipientCount={recipientCount}
          messagePreview={message.slice(0, 120) + (message.length > 120 ? "..." : "")}
          category={selectedCat.label}
          onConfirm={handleSend}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
