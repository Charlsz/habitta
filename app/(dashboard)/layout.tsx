import { logoutAction } from "@/modules/auth/application/auth.actions";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/modules/core/components"; // Verify index.ts re-exports this

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] bg-sidebar border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 font-serif font-bold text-2xl tracking-tight text-foreground">
          Habitta
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {/* Dashboard */}
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-caramel)] group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          
          {/* Organizaciones */}
          <Link href="/organizations" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-sage)] group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Organizaciones</span>
          </Link>
          
          {/* Activos */}
          <Link href="/assets" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A8957D] group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Activos</span>
          </Link>
          
          {/* Tickets */}
          <Link href="/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8DECE] group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Tickets</span>
          </Link>
          
          {/* Agenda */}
          <Link href="/scheduling" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group flex-col items-start hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-border-focus group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Agenda</span>
          </Link>

           <Link href="/scheduling" className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-white transition-colors group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A6A52] group-hover:scale-125 transition-transform"></span>
            <span className="font-medium text-sm">Agenda</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 bg-surface-high border-b border-border flex items-center px-8 justify-end gap-6 shadow-[var(--shadow-card)]">
          <div className="text-sm font-medium text-muted">Perfil</div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Cerrar Sesión
            </Button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
