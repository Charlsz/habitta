"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
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

const ORG_TYPE_ICON: Record<string, string> = {
  residential:  "🏘",
  real_estate:  "🏢",
  construction: "🏗",
  commercial:   "🏪",
};

function navItems(orgId: string) {
  return [
    { href: `/dashboard?org=${orgId}`,                label: "Dashboard",  dot: "#d4a373" },
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
  const activeOrg  = orgs.find(o => o.id === paramOrgId) ?? orgs[0];
  const activeId   = activeOrg?.id ?? "";

  const [selectorOpen, setSelectorOpen] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* ── Organizaciones ── */}
      <div className="px-3 pt-2 pb-1">
        <Link
          href="/organizations"
          className={[
            "flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150",
            pathname.startsWith("/organizations")
              ? "bg-white/70 text-[var(--foreground)] shadow-sm"
              : "text-[var(--foreground)] hover:bg-white/40",
          ].join(" ")}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#7CAE7A" }} />
          Organizaciones
        </Link>
      </div>

      {/* ── Selector org activa ── */}
      {activeOrg && (
        <div className="mx-3 mb-2">
          <button
            onClick={() => setSelectorOpen(p => !p)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] bg-white/50 hover:bg-white/70 border border-[var(--border)] transition-all text-left"
          >
            <span className="text-base leading-none">
              {ORG_TYPE_ICON[activeOrg.type] ?? "🏢"}
            </span>
            <span className="flex-1 text-xs font-semibold text-[var(--foreground)] truncate">
              {activeOrg.name}
            </span>
            <span className="text-[var(--muted)] text-xs">{selectorOpen ? "▲" : "▼"}</span>
          </button>

          {selectorOpen && orgs.length > 1 && (
            <div className="mt-1 rounded-[8px] border border-[var(--border)] bg-white/90 shadow-lg overflow-hidden">
              {orgs.map(o => (
                <Link
                  key={o.id}
                  href={`/dashboard?org=${o.id}`}
                  onClick={() => setSelectorOpen(false)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--sidebar-bg)] transition-colors",
                    o.id === activeId ? "font-semibold text-[#d4a373]" : "text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <span>{ORG_TYPE_ICON[o.type] ?? "🏢"}</span>
                  <span className="truncate">{o.name}</span>
                  {o.id === activeId && <span className="ml-auto">✓</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Divisor ── */}
      {activeOrg && (
        <div className="mx-5 mb-2">
          <div className="border-t border-[var(--border)]" />
        </div>
      )}

      {/* ── Nav items ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {activeId ? (
          navItems(activeId).map(({ href, label, dot }) => (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150 group",
                isActive(href)
                  ? "bg-white/70 text-[var(--foreground)] shadow-sm"
                  : "text-[var(--foreground)] hover:bg-white/40",
              ].join(" ")}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: dot }}
              />
              {label}
            </Link>
          ))
        ) : (
          <p className="px-3 py-3 text-xs text-[var(--muted)]">
            Selecciona una organización para continuar.
          </p>
        )}
      </nav>

      {/* ── Cerrar sesión ── */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </>
  );
}
