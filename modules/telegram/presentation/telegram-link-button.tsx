"use client";

import { useState } from "react";

interface Props {
  organizationId: string;
  organizationName: string;
}

export function TelegramLinkButton({ organizationId, organizationName }: Props) {
  const telegramLink = `https://t.me/HabittaBot?start=ORG_${organizationId}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(telegramLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback para navegadores sin clipboard API
      const el = document.createElement("textarea");
      el.value = telegramLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl">📲</span>
        <div className="min-w-0">
          <p className="font-semibold text-blue-900 text-sm">
            Asistente virtual en Telegram
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Comparte este link con los residentes de{" "}
            <span className="font-medium">{organizationName}</span> para que
            puedan reportar novedades directamente desde Telegram.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="text-xs bg-white border border-blue-200 rounded px-2 py-1 text-blue-800 truncate max-w-xs block">
              {telegramLink}
            </code>
          </div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
            copied
              ? "bg-green-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-4 py-2 rounded-lg font-medium bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all"
        >
          Abrir
        </a>
      </div>
    </div>
  );
}
