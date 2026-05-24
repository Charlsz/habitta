import { logoutAction } from "@/modules/auth/application/auth.actions";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { ReactNode, Suspense } from "react";
import { NotificationBell } from "@/modules/notifications/presentation/notification-bell";
import {
  getUnreadNotifications,
  getUnreadCount,
} from "@/modules/notifications/infrastructure/notification.repository";
import { AIAssistantLoader } from "@/modules/dashboard/presentation/ai-assistant/AIAssistantLoader";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/modules/core/components/SidebarNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user     = await requireAuth();
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
    getUnreadCount().catch(()   => 0),
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* ════ Sidebar ════ */}
      <aside
        className="w-56 shrink-0 flex flex-col"
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)" }}
      >
        {/* Nav reactivo */}
        <Suspense fallback={null}>
          <SidebarNav orgs={orgs} logoutAction={logoutAction} />
        </Suspense>
      </aside>

      {/* ════ Main area ════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="h-16 shrink-0 flex items-center px-6 justify-end gap-4"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}
        >
          <NotificationBell unreadCount={unreadCount} notifications={notifications} />
          <span className="text-sm font-medium text-[var(--foreground)]/60 hidden sm:block">
            {displayName}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
            style={{ backgroundColor: "#d4a373" }}
            title={user.email}
          >
            {initials}
          </div>
        </header>

        {/* Page content — cada página define su propio padding */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Suspense fallback={null}>
        <AIAssistantLoader />
      </Suspense>
    </div>
  );
}
