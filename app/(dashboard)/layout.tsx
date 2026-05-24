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
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/modules/core/components/SidebarNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();
  const supabase = await createClient();

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

  // Cargar todas las orgs del usuario para el selector
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, type)")
    .eq("user_id", user.id)
    .order("created_at");

  const orgs = (memberships ?? []).map((m: any) => ({
    id:   m.organizations?.id   ?? m.organization_id,
    name: m.organizations?.name ?? "Org",
    type: m.organizations?.type ?? "residential",
    role: m.role,
  }));

  const [notifications, unreadCount] = await Promise.all([
    getUnreadNotifications(5).catch(() => []),
    getUnreadCount().catch(()  => 0),
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">

      {/* ── Sidebar ── */}
      <aside className="w-[240px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col">

        {/* Logo */}
        <div className="h-16 flex items-center px-5">
          <span
            className="font-serif font-bold text-2xl tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Habitta
          </span>
        </div>

        {/* Nav reactivo (lee pathname en client) */}
        <SidebarNav orgs={orgs} logoutAction={logoutAction} />
      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="h-16 shrink-0 bg-[var(--background)] border-b border-[var(--border)] flex items-center px-8 justify-end gap-3"
        >
          <NotificationBell unreadCount={unreadCount} notifications={notifications} />

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

        <main className="flex-1 overflow-auto">
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
