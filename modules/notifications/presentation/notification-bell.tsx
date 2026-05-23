"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Bell } from "lucide-react";
import { markNotificationsReadAction } from "../application/notification.actions";
import { Notification, NOTIFICATION_ICON, NOTIFICATION_COLOR } from "../domain/notification.schema";

interface Props {
  unreadCount:   number;
  notifications: Notification[];
}

export function NotificationBell({ unreadCount, notifications }: Props) {
  const [open, setOpen]           = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleMarkRead() {
    startTransition(async () => {
      await markNotificationsReadAction();
      setOpen(false);
    });
  }

  return (
    <div ref={ref} className="relative">
      {/* Botón campana */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-[rgba(0,0,0,0.05)] transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-[var(--muted)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-[var(--border)] bg-white shadow-xl overflow-hidden">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <span className="text-sm font-bold text-[var(--foreground)]">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                  {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkRead}
                disabled={isPending}
                className="text-xs text-[#c8935f] hover:underline font-medium disabled:opacity-50"
              >
                {isPending ? "Marcando..." : "Marcar leídas"}
              </button>
            )}
          </div>

          {/* Lista */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                No tienes notificaciones pendientes 🎉
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-[var(--surface)] transition-colors">
                  <span className={`mt-0.5 text-base shrink-0`}>
                    {NOTIFICATION_ICON[n.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[10px] text-[var(--subtle)] mt-1">
                      {new Date(n.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
