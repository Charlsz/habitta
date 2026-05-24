import { logoutAction } from "@/modules/auth/application/auth.actions";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import Link from "next/link";
import { ReactNode, Suspense } from "react";
import { Button } from "@/modules/core/components";
import { NotificationBell } from "@/modules/notifications/presentation/notification-bell";
import {
  getUnreadNotifications,
  getUnreadCount,
} from "@/modules/notifications/infrastructure/notification.repository";
import { AIAssistantLoader } from "@/modules/dashboard/presentation/ai-assistant/AIAssistantLoader";

interface NavItem {
  href:  string;
  label: string;
  dot:   string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",             label: "Dashboard",      dot: "#d4a373" },
  { href: "/dashboard/analytics",   label: "Analytics",      dot: "#a78bfa" },
  { href: "/organizations",         label: "Organizaciones", dot: "#7CAE7A" },
  { href: "/residents",             label: "Residentes",      dot: "#f472b6" },
  { href: "/assets",                label: "Activos",         dot: "#6B9AB8" },
  { href: "/tickets",               label: "Tickets",         dot: "#E07B54" },
  { href: "/scheduling",            label: "Agenda",          dot: "#9B8BB4" },
  { href: "/notifications/broadcast", label: "Broadcast",     dot: "#34d399" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "Usuario";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [notifications, unreadCount] = await Promise.all([
    getUnreadNotifications(5).catch(() => []),
    getUnreadCount().catch(() => 0),
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">

      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col">
        <div className="h-16 flex items-center px-6">
          <span
            className="font-serif font-bold text-2xl tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Habitta
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, dot }) => (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[8px] group",
                "text-sm font-medium text-[var(--foreground)]",
                "transition-all duration-150",
                "hover:bg-[rgba(255,255,255,0.55)]",
              ].join(" ")}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: dot }}
              />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)]">
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className={[
            "h-16 shrink-0 bg-[var(--background)] border-b border-[var(--border)]",
            "flex items-center px-8 justify-end gap-3",
          ].join(" ")}
        >
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
          />

          <span className="text-sm font-medium text-[var(--muted)] hidden sm:block">
            {displayName}
          </span>

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: "#d4a373" }}
            title={user.email}
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>

      {/* Asistente IA flotante */}
      <Suspense fallback={null}>
        <AIAssistantLoader />
      </Suspense>
    </div>
  );
}
