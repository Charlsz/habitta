"use client";

interface Props {
  message: string;
  categoryHeader: string;
}

// Convierte *texto* a <strong>texto</strong> para la preview
function renderMarkdown(text: string) {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export function BroadcastPreview({ message, categoryHeader }: Props) {
  const preview = message.trim()
    ? `${categoryHeader}\n\n${message.trim()}`
    : `${categoryHeader}\n\nTu mensaje aparecerá aquí...`;

  return (
    <div>
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Preview en Telegram
      </p>
      {/* Teléfono mock */}
      <div className="mx-auto w-full max-w-[280px] bg-[#17212b] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#2b5278] flex items-center justify-center text-sm">🏠</div>
          <div>
            <p className="text-white text-xs font-semibold">Habitta Bot</p>
            <p className="text-white/40 text-[10px]">bot</p>
          </div>
        </div>
        <div className="bg-[#2b5278] rounded-xl rounded-tl-sm p-3 text-white text-xs leading-relaxed max-w-[85%]">
          <p
            dangerouslySetInnerHTML={{ __html: renderMarkdown(preview) }}
          />
          <p className="text-white/40 text-[10px] text-right mt-1">
            {new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}
