"use client";

interface Props {
  recipientCount: number;
  messagePreview: string;
  category: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BroadcastConfirmModal({ recipientCount, messagePreview, category, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="habitta-card-high w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4a373]/15 flex items-center justify-center text-xl">
            📤
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)]">Confirmar envío masivo</h3>
            <p className="text-xs text-[var(--muted)]">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4 space-y-2 border border-[var(--border)]">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Categoría</span>
            <span className="font-semibold">{category}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Destinatarios</span>
            <span className="font-bold text-[#d4a373]">{recipientCount} residentes</span>
          </div>
          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-1">Vista previa del mensaje:</p>
            <p className="text-sm text-[var(--foreground)] italic line-clamp-3">"{messagePreview}"</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 habitta-secondary py-2.5 rounded-lg text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#d4a373] hover:bg-[#c8935f] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Sí, enviar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
