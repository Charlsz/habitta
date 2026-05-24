"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/modules/core/components";

interface Org {
  id:   string;
  name: string;
  type: string;
  role: string;
}

interface Props {
  orgs:         Org[];
  logoutAction: () => Promise<void>;
}

function navItems(orgId: string) {
  return [
    { href: `/dashboard?org=${orgId}`,               label: "Dashboard",  dot: "#d4a373" },
    { href: `/clients?org=${orgId}`,                  label: "Clientes",   dot: "#f472b6" },
    { href: `/assets?org=${orgId}`,                   label: "Unidades",   dot: "#6B9AB8" },
    { href: `/tickets?org=${orgId}`,                  label: "Tickets",    dot: "#E07B54" },
    { href: `/scheduling?org=${orgId}`,               label: "Agenda",     dot: "#9B8BB4" },
    { href: `/notifications/broadcast?org=${orgId}`,  label: "Broadcast",  dot: "#34d399" },
    { href: `/dashboard/analytics?org=${orgId}`,      label: "Analytics",  dot: "#a78bfa" },
  ];
}

export function SidebarNav({ orgs, logoutAction }: Props) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const paramOrgId = searchParams.get("org");
  const activeOrg  = orgs.find(o => o.id === paramOrgId) ?? null;
  const activeId   = activeOrg?.id ?? "";

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const linkCls = (active: boolean) =>
    [
      "flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150 group",
      active
        ? "bg-white/70 text-[var(--foreground)] shadow-sm"
        : "text-[var(--foreground)] hover:bg-white/40",
    ].join(" ");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">

        {/* Organizaciones — siempre visible */}
        <Link
          href="/organizations"
          className={linkCls(pathname.startsWith("/organizations"))}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#7CAE7A" }} />
          Organizaciones
        </Link>

        {/* Solo si hay una org activa seleccionada */}
        {activeId && (
          <>
            {/* Indicador de org activa — solo texto, sin botón feo */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] truncate">
                {activeOrg?.name}
              </p>
            </div>

            {/* Nav items */}
            {navItems(activeId).map(({ href, label, dot }) => (
              <Link
                key={href}
                href={href}
                className={linkCls(isActive(href))}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                  style={{ backgroundColor: dot }}
                />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Cerrar sesión */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
