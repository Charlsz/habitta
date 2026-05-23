import { logoutAction } from "@/modules/auth/application/auth.actions";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900">
      {/* Sidebar: Presentational (Deberá extraerse luego a src/modules/core/presentation/sidebar.tsx) */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-blue-600">
          Habitta
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Dashboard</Link>
          <Link href="/organizations" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Organizaciones</Link>
          <Link href="/assets" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Activos</Link>
          <Link href="/tickets" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Tickets</Link>
          <Link href="/scheduling" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Agenda</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-end gap-4">
          <div className="text-sm font-medium">Perfil</div>
          <form action={logoutAction}>
            <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md font-medium text-gray-700">
              Cerrar Sesión
            </button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
