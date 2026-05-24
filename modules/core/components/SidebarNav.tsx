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

const NAV_ITEMS = (orgId: string) => [
  { href: `/dashboard?org=${orgId}`,              label: "Dashboard",  dot: "#d4a373" },
  { href: `/clients?org=${orgId}`,                label: "Clientes",   dot: "#f472b6" },
  { href: `/assets?org=${orgId}`,                 label: "Unidades",   dot: "#6B9AB8" },
  { href: `/tickets?org=${orgId}`,                label: "Tickets",    dot: "#E07B54" },
  { href: `/scheduling?org=${orgId}`,             label: "Agenda",     dot: "#9B8BB4" },
  { href: `/notifications/broadcast?org=${orgId}`,label: "Broadcast",  dot: "#34d399" },
  { href: `/dashboard/analytics?org=${orgId}`,    label: "Analytics",  dot: "#a78bfa" },
];

export function SidebarNav({ orgs, logoutAction }: Props) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const paramOrgId   = searchParams.get("org");
  const activeOrg    = orgs.find((o) => o.id === paramOrgId) ?? null;

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const itemCls = (active: boolean) =>
    [
      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium",
      "transition-all duration-150 group w-full",
      active
        ? "bg-white/80 text-[var(--foreground)] shadow-sm"
        : "text-[var(--foreground)]/80 hover:bg-white/50 hover:text-[var(--foreground)]",
    ].join(" ");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">

        {/* ── Organizaciones — siempre visible ── */}
        <Link href="/organizations" className={itemCls(pathname.startsWith("/organizations"))}>
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "#7CAE7A" }}
          />
          Organizaciones
        </Link>

        {/* ── Solo si hay ?org= válido ── */}
        {activeOrg && (
          <>
            {/* Divider + label de org activa */}
            <div className="pt-4 pb-1 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]/40 truncate">
                {activeOrg.name}
              </p>
            </div>

            {/* Nav items */}
            {NAV_ITEMS(activeOrg.id).map(({ href, label, dot }) => (
              <Link key={href} href={href} className={itemCls(isActive(href))}>
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

      {/* ── Cerrar sesión — siempre al fondo ── */}
      <div className="px-3 py-4 shrink-0 border-t border-[var(--border)]">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm w-full
              text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90
              hover:bg-white/50 transition-all duration-150 font-medium"
          >
            <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--foreground)]/20" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
