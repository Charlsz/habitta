"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ticket, Calendar, Building, LayoutDashboard,
  Users, Paperclip, Menu, X, ArrowRight
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Ticket,
    title: "Tickets y solicitudes",
    desc: "Crea, asigna y da seguimiento a incidencias, prioridades y estados en un solo tablero.",
    bg: "#faedcd",
    dot: "#d4a373",
  },
  {
    icon: Calendar,
    title: "Agenda operativa",
    desc: "Programa eventos y controla reservas con validador anti-cruces de fechas.",
    bg: "#e9edc9",
    dot: "#7CAE7A",
  },
  {
    icon: Building,
    title: "Gestión de activos",
    desc: "Administra tu inventario, propiedades y recursos operativos de forma central.",
    bg: "#faedcd",
    dot: "#6B9AB8",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard en tiempo real",
    desc: "KPIs instantáneos. Mantén la vista en cuellos de botella e incidencias abiertas.",
    bg: "#ccd5ae",
    dot: "#d4a373",
  },
  {
    icon: Users,
    title: "Control por roles",
    desc: "Multi-empresa nativa. Administradores, miembros y clientes ven solo lo que deben.",
    bg: "#faedcd",
    dot: "#9B8BB4",
  },
  {
    icon: Paperclip,
    title: "Adjuntos y evidencias",
    desc: "Sube fotos, PDFs e imágenes como evidencia al resolver tickets. Todo en la nube.",
    bg: "#e9edc9",
    dot: "#E07B54",
  },
];

const SECTORS = [
  {
    title: "Conjuntos residenciales",
    desc: "PQRs, reservas de zonas comunes, control de novedades y comunicación con residentes.",
    accent: "#d4a373",
  },
  {
    title: "Constructoras",
    desc: "Reporte de novedades de obra, seguimiento fotográfico a incidencias y control por proyecto.",
    accent: "#E07B54",
  },
  {
    title: "Inmobiliarias",
    desc: "Canaliza mantenimientos locativos de tus arrendatarios a proveedores técnicos de forma profesional.",
    accent: "#7CAE7A",
  },
  {
    title: "Operaciones multisede",
    desc: "Supervisa sucursales a nivel nacional con KPIs claros de resolución desde gerencia general.",
    accent: "#6B9AB8",
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#fefae0",
        color: "#2C2416",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#fefae0",
          borderBottom: "1px solid #E8DECE",
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#2C2416",
                textDecoration: "none",
              }}
            >
              Habitta
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {["#como-funciona", "#caracteristicas", "#sectores"].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#7A6A52",
                    textDecoration: "none",
                    transition: "color 150ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#2C2416")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#7A6A52")}
                >
                  {["Cómo funciona", "Características", "Sectores"][i]}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#7A6A52",
                  textDecoration: "none",
                }}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#d4a373",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  padding: "0.5rem 1.25rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background-color 150ms",
                  border: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C4915F")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d4a373")}
              >
                Empezar gratis
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6A52" }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              backgroundColor: "#faedcd",
              borderTop: "1px solid #E8DECE",
              padding: "1rem 1.5rem 1.5rem",
            }}
          >
            {[["#como-funciona", "Cómo funciona"], ["#caracteristicas", "Características"], ["#sectores", "Sectores"]].map(
              ([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.625rem 0",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "#2C2416",
                    textDecoration: "none",
                    borderBottom: "1px solid #E8DECE",
                  }}
                >
                  {label}
                </a>
              )
            )}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.625rem",
                  border: "1px solid #E8DECE",
                  borderRadius: "8px",
                  color: "#7A6A52",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.625rem",
                  backgroundColor: "#d4a373",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Empezar gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: "5rem 1.5rem 6rem" }}>
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#faedcd",
                border: "1px solid #E8DECE",
                borderRadius: "999px",
                padding: "0.25rem 0.875rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#7A6A52",
                marginBottom: "2rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#d4a373",
                  display: "inline-block",
                }}
              />
              Plataforma operativa inteligente
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#2C2416",
                marginBottom: "1.5rem",
              }}
            >
              Convierte tu operación dispersa en{" "}
              <span style={{ color: "#d4a373" }}>gestión estructurada</span>
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.7,
                color: "#7A6A52",
                maxWidth: "38rem",
                margin: "0 auto 2.5rem",
              }}
            >
              Habitta centraliza tus solicitudes, tickets, activos y agenda sin importar el tamaño de tu organización.
              Vuelve la paz mental a tu equipo.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#d4a373",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background-color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C4915F")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d4a373")}
              >
                Empezar gratis hoy
              </Link>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.375rem",
                  backgroundColor: "#faedcd",
                  color: "#2C2416",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  border: "1px solid #E8DECE",
                  textDecoration: "none",
                  transition: "background-color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e9edc9")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#faedcd")}
              >
                Ver demo <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* APP MOCKUP */}
          <div
            className="mx-auto mt-20"
            style={{
              maxWidth: "56rem",
              backgroundColor: "#faedcd",
              border: "1px solid #E8DECE",
              borderRadius: "16px",
              padding: "1rem",
              boxShadow: "0 8px 32px rgba(44,36,22,0.10)",
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                backgroundColor: "#e9edc9",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  height: 40,
                  backgroundColor: "#fefae0",
                  borderBottom: "1px solid #E8DECE",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 1rem",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#E07B54", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#d4a373", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#7CAE7A", display: "inline-block" }} />
              </div>

              {/* Mockup body */}
              <div style={{ display: "flex", height: 260 }}>
                {/* Sidebar mockup */}
                <div
                  style={{
                    width: 160,
                    backgroundColor: "#e9edc9",
                    borderRight: "1px solid #E8DECE",
                    padding: "1rem 0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                  className="hidden sm:flex"
                >
                  <div style={{ height: 16, backgroundColor: "#d4a373", borderRadius: 4, width: "60%", marginBottom: 8, opacity: 0.8 }} />
                  {["#d4a373", "#7CAE7A", "#6B9AB8", "#E07B54"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        height: 30,
                        backgroundColor: i === 0 ? "#fefae0" : "transparent",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 0.5rem",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: c, display: "inline-block" }} />
                      <div style={{ height: 8, backgroundColor: "#C8B99A", borderRadius: 3, flex: 1, opacity: 0.6 }} />
                    </div>
                  ))}
                </div>

                {/* Content mockup */}
                <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Stat cards row */}
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {[["#ccd5ae", "#3D5A1A"], ["#faedcd", "#8B5E1A"], ["#e9edc9", "#2C4A6E"]].map(([bg, fg], i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 64,
                          backgroundColor: bg,
                          border: "1px solid #E8DECE",
                          borderRadius: 8,
                          padding: "0.5rem 0.75rem",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <div style={{ height: 7, backgroundColor: fg, borderRadius: 2, width: "50%", opacity: 0.4 }} />
                        <div style={{ height: 12, backgroundColor: fg, borderRadius: 2, width: "35%", opacity: 0.7 }} />
                      </div>
                    ))}
                  </div>

                  {/* Table mockup */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#fefae0",
                      border: "1px solid #E8DECE",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ height: 32, backgroundColor: "#faedcd", borderBottom: "1px solid #E8DECE", display: "flex", alignItems: "center", padding: "0 0.75rem", gap: "1rem" }}>
                      {["45%", "20%", "25%"].map((w, i) => (
                        <div key={i} style={{ height: 7, backgroundColor: "#C8B99A", borderRadius: 2, width: w, opacity: 0.6 }} />
                      ))}
                    </div>
                    {[0, 1, 2].map((r) => (
                      <div
                        key={r}
                        style={{
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 0.75rem",
                          gap: "1rem",
                          borderBottom: "1px solid #E8DECE",
                          backgroundColor: r % 2 === 0 ? "#fefae0" : "#faedcd",
                        }}
                      >
                        <div style={{ height: 6, backgroundColor: "#C8B99A", borderRadius: 2, width: "45%", opacity: 0.5 }} />
                        <div
                          style={{
                            height: 16,
                            backgroundColor: ["#ccd5ae", "#faedcd", "#e9edc9"][r],
                            borderRadius: 999,
                            width: "20%",
                            opacity: 0.9,
                          }}
                        />
                        <div style={{ height: 6, backgroundColor: "#C8B99A", borderRadius: 2, width: "25%", opacity: 0.4 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ────────────────────────────────────────────────────────── */}
        <section
          id="como-funciona"
          style={{ backgroundColor: "#faedcd", borderTop: "1px solid #E8DECE", borderBottom: "1px solid #E8DECE", padding: "5rem 1.5rem" }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 600,
                  color: "#2C2416",
                  marginBottom: "1rem",
                }}
              >
                ¿Tu operación todavía vive en WhatsApp y hojas de cálculo?
              </h2>
              <p style={{ color: "#7A6A52", fontSize: "1rem", maxWidth: "34rem", margin: "0 auto" }}>
                La comunicación desordenada cuesta tiempo, dinero y clientes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Sin trazabilidad", desc: "Las solicitudes se pierden. Nadie sabe quién está haciendo qué ni el estado real de un requerimiento.", dot: "#E07B54" },
                { title: "Sin centralización", desc: "Datos dispersos en 5 chats, docenas de correos y archivos Excel desactualizados.", dot: "#d4a373" },
                { title: "Sin visibilidad", desc: "Gerenciar a ciegas. Sin métricas claras de resolución, tiempos ni volumen de operación.", dot: "#6B9AB8" },
              ].map(({ title, desc, dot }) => (
                <div
                  key={title}
                  style={{
                    backgroundColor: "#fefae0",
                    border: "1px solid #E8DECE",
                    borderRadius: 12,
                    padding: "1.75rem",
                    boxShadow: "0 1px 3px rgba(44,36,22,0.06)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: dot,
                      marginBottom: "1rem",
                    }}
                  />
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#7A6A52", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARACTERÍSTICAS ────────────────────────────────────────────────── */}
        <section id="caracteristicas" style={{ backgroundColor: "#fefae0", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 600,
                  color: "#2C2416",
                }}
              >
                Todo lo que necesitas para operar con claridad
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc, bg, dot }) => (
                <div
                  key={title}
                  style={{
                    backgroundColor: bg,
                    border: "1px solid #E8DECE",
                    borderRadius: 12,
                    padding: "1.5rem",
                    transition: "box-shadow 200ms, transform 200ms",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(44,36,22,0.10)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      color: dot,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.375rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "#7A6A52", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTORES ────────────────────────────────────────────────────────── */}
        <section
          id="sectores"
          style={{ backgroundColor: "#e9edc9", borderTop: "1px solid #E8DECE", borderBottom: "1px solid #E8DECE", padding: "5rem 1.5rem" }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 600,
                  color: "#2C2416",
                }}
              >
                Diseñado para múltiples sectores
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {SECTORS.map(({ title, desc, accent }) => (
                <div
                  key={title}
                  style={{
                    backgroundColor: "#fefae0",
                    border: "1px solid #E8DECE",
                    borderLeft: `3px solid ${accent}`,
                    borderRadius: "0 12px 12px 0",
                    padding: "1.5rem",
                    boxShadow: "0 1px 3px rgba(44,36,22,0.06)",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#7A6A52", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ───────────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: "#faedcd", padding: "5rem 1.5rem", borderTop: "1px solid #E8DECE" }}>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 700,
                color: "#2C2416",
                marginBottom: "1rem",
              }}
            >
              Empieza a operar con orden hoy
            </h2>
            <p style={{ color: "#7A6A52", fontSize: "1rem", marginBottom: "2rem" }}>
              Únete a docenas de empresas que dejaron atrás el caos y abrazaron la eficiencia de Habitta.
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#d4a373",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9375rem",
                padding: "0.75rem 2.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "background-color 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C4915F")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d4a373")}
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#2C2416",
          color: "#A8957D",
          padding: "2.5rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#faedcd",
              }}
            >
              Habitta
            </span>
            <p style={{ fontSize: "0.8125rem" }}>© {new Date().getFullYear()} Habitta. Todos los derechos reservados.</p>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
            <Link href="/login" style={{ color: "#A8957D", textDecoration: "none" }}>Ingresar</Link>
            <Link href="/register" style={{ color: "#d4a373", textDecoration: "none" }}>Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
