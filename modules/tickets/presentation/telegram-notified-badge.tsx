interface Props {
  notifiedAt: string | null | undefined;
}

export function TelegramNotifiedBadge({ notifiedAt }: Props) {
  if (!notifiedAt) return null;

  const date = new Date(notifiedAt);
  const formatted = date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200"
      title={`Notificación enviada por Telegram el ${formatted}`}
    >
      📱 Telegram notificado
      <span className="text-blue-400 font-normal">· {formatted}</span>
    </span>
  );
}
