import { logoutAction } from "@/modules/auth/application/auth.actions";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/modules/core/components";

interface NavItem {
  href: string;
  label: string;
  dot: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",     label: "Dashboard",       dot: "#d4a373" },
  { href: "/organizations", label: "Organizaciones",  dot: "#7CAE7A" },
  { href: "/assets",        label: "Activos",          dot: "#6B9AB8" },
  { href: "/tickets",       label: "Tickets",          dot: "#E07B54" },
  { href: "/scheduling",    label: "Agenda",           dot: "#9B8BB4" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">

      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col">

        {/* Logo */}
        <div className="h-16 flex items-center px-6">
          <span
            className="font-serif font-bold text-2xl tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Habitta
          </span>
        </div>

        {/* Navegación */}
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

        {/* Footer del sidebar */}
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

        {/* Header */}
        <header
          className={[
            "h-16 shrink-0 bg-[var(--background)] border-b border-[var(--border)]",
            "flex items-center px-8 justify-end gap-4",
          ].join(" ")}
        >
          <span className="text-sm font-medium text-[var(--muted)]">Perfil</span>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
