"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquareText, CalendarCheck2, Home,
  BarChart3, ShieldCheck, FileText,
  BellRing, Sparkles, Menu, X
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Todo en un solo lugar",
    desc: "Recibe solicitudes, quejas y peticiones de tus residentes o clientes sin perder ninguna. Sin WhatsApp, sin correos perdidos.",
    bg: "#faedcd", dot: "#d4a373"
  },
  {
    icon: CalendarCheck2,
    title: "Agenda sin enredos",
    desc: "Programa visitas, mudanzas o reservas de zonas comunes con un clic. El sistema avisa si ya hay algo agendado para ese momento.",
    bg: "#e9edc9", dot: "#7CAE7A"
  },
  {
    icon: Home,
    title: "Controla tus propiedades",
    desc: "Registra todos tus apartamentos, parqueaderos, bodegas y zonas comunes. Asígnalos a propietarios o arrendatarios fácilmente.",
    bg: "#faedcd", dot: "#6B9AB8"
  },
  {
    icon: BarChart3,
    title: "Ve qué está pasando",
    desc: "Un tablero visual te muestra cuántas solicitudes están abiertas, cuáles llevan más tiempo sin respuesta y qué tan bien está trabajando tu equipo.",
    bg: "#ccd5ae", dot: "#d4a373"
  },
  {
    icon: ShieldCheck,
    title: "Cada quien ve lo suyo",
    desc: "El administrador ve todo. Los residentes solo ven sus propias solicitudes. Sin mezclas, sin confusiones.",
    bg: "#faedcd", dot: "#9B8BB4"
  },
  {
    icon: FileText,
    title: "Documentos en segundos",
    desc: "Genera cartas de paz y salvo, circulares, actas de reunión y más con inteligencia artificial. Descárgalos o envíalos directo por Telegram.",
    bg: "#e9edc9", dot: "#E07B54"
  },
];

const STEPS = [
  {
    num: "01",
    title: "Crea tu espacio",
    desc: "Registra tu conjunto, empresa u organización en menos de 2 minutos.",
    color: "#d4a373"
  },
  {
    num: "02",
    title: "Agrega a tu gente",
    desc: "Invita a tu equipo y tus residentes o clientes. Cada uno entra con su propio acceso.",
    color: "#7CAE7A"
  },
  {
    num: "03",
    title: "Empieza a operar",
    desc: "Recibe solicitudes, respóndelas, programa eventos y deja de usar WhatsApp para trabajar.",
    color: "#6B9AB8"
  },
];

const SECTORS = [
  {
    emoji: "🏢",
    title: "Conjuntos residenciales",
    desc: "Gestiona quejas, solicitudes, reservas de zonas comunes y pagos de administración sin volverte loco.",
    accent: "#d4a373"
  },
  {
    emoji: "🏗️",
    title: "Constructoras",
    desc: "Registra novedades de obra, asigna responsables y ten un historial fotográfico de cada incidencia.",
    accent: "#E07B54"
  },
  {
    emoji: "🏠",
    title: "Inmobiliarias",
    desc: "Coordina mantenimientos, atiende a tus arrendatarios y lleva el control de cada propiedad en un solo sitio.",
    accent: "#7CAE7A"
  },
  {
    emoji: "🏪",
    title: "Negocios con varias sedes",
    desc: "Supervisa lo que pasa en cada sede desde un único tablero. Sin perder el hilo de ninguna.",
    accent: "#6B9AB8"
  },
];

const TESTIMONIALS = [
  {
    text: "\"Antes todo era un caos de mensajes en WhatsApp. Ahora cada solicitud tiene un estado y un responsable. Por fin puedo dormir tranquila.\"",
    name: "Luisa M.",
    role: "Administradora de conjunto",
    color: "#d4a373"
  },
  {
    text: "\"Lo instalé en 10 minutos y en la primera semana ya tenía a todos mis residentes enviando sus solicitudes por aquí. Increíble.\"",
    name: "Carlos R.",
    role: "Administrador independiente",
    color: "#7CAE7A"
  },
  {
    text: "\"El asistente de IA me generó el acta de la reunión en 30 segundos y la envió por Telegram. Eso antes me tomaba una hora.\"",
    name: "Sandra P.",
    role: "Gestora de propiedades",
    color: "#6B9AB8"
  },
];

interface Props {
  isLoggedIn: boolean;
  displayName: string | null;
  initials: string | null;
}

export default function LandingClient({ isLoggedIn, displayName, initials }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryHref  = "/dashboard";
  const primaryLabel = isLoggedIn ? "Ir a mi panel" : "Probar gratis";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefae0", color: "#2C2416", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#fefae0", borderBottom: "1px solid #E8DECE" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">

            <Link href="/" className="inline-flex items-center hover:opacity-85 transition-opacity" aria-label="Inicio">
              <Image src="/habitta_icon.png" alt="Habitta" width={96} height={32} priority className="block object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {(["#como-funciona", "#que-puedes-hacer", "#para-quien"] as const).map((href, i) => (
                <a key={href} href={href}
                  style={{ fontSize: "0.875rem", fontWeight: 500, color: "#7A6A52", textDecoration: "none", transition: "color 150ms" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#2C2416")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#7A6A52")}>
                  {["Cómo funciona", "Qué puedes hacer", "¿Para quién?"][i]}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn && initials ? (
                <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#7A6A52" }}>{displayName}</span>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#d4a373", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", flexShrink: 0 }}>
                    {initials}
                  </div>
                </Link>
              ) : (
                <>
                  <Link href="/login" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#7A6A52", textDecoration: "none" }}>Ingresar</Link>
                  <Link href="/register"
                    style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff", backgroundColor: "#d4a373", padding: "0.4rem 1.1rem", borderRadius: "7px", textDecoration: "none", transition: "background 150ms" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#C4915F")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d4a373")}>
                    Crear cuenta gratis
                  </Link>
                </>
              )}
            </div>

            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7A6A52" }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ backgroundColor: "#faedcd", borderTop: "1px solid #E8DECE", padding: "1rem 1.5rem 1.5rem" }}>
            {([["#como-funciona", "Cómo funciona"], ["#que-puedes-hacer", "Qué puedes hacer"], ["#para-quien", "¿Para quién?"]] as [string,string][]).map(
              ([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "0.625rem 0", fontSize: "0.9375rem", fontWeight: 500, color: "#2C2416", textDecoration: "none", borderBottom: "1px solid #E8DECE" }}>
                  {label}
                </a>
              )
            )}
            <div className="mt-4 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", border: "1px solid #E8DECE", borderRadius: "8px", color: "#2C2416", fontWeight: 500, textDecoration: "none" }}>
                  {initials && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#d4a373", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.7rem", flexShrink: 0 }}>{initials}</div>
                  )}
                  Ir a mi panel
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", textAlign: "center", padding: "0.625rem", border: "1px solid #E8DECE", borderRadius: "8px", color: "#7A6A52", fontWeight: 500, textDecoration: "none" }}>
                    Ingresar
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", textAlign: "center", padding: "0.625rem", backgroundColor: "#d4a373", borderRadius: "8px", color: "#fff", fontWeight: 600, textDecoration: "none" }}>
                    Crear cuenta gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ── HERO ── */}
        <section style={{ padding: "5rem 1.5rem 6rem" }}>
          <div className="mx-auto max-w-4xl text-center">

            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#faedcd", border: "1px solid #E8DECE", borderRadius: "999px", padding: "0.25rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600, color: "#7A6A52", marginBottom: "2rem" }}>
              <Sparkles size={13} style={{ color: "#d4a373" }} />
              Ahora con inteligencia artificial
            </div>

            <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(2.4rem, 6vw, 3.75rem)", fontWeight: 700, lineHeight: 1.15, color: "#2C2416", marginBottom: "1.5rem" }}>
              Todo lo de tu propiedad
              {" "}ordenado en{" "}
              <span style={{ color: "#d4a373" }}>un solo lugar</span>
            </h1>

            <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "#7A6A52", maxWidth: "40rem", margin: "0 auto 2.5rem" }}>
              Habitta es la plataforma que te ayuda a recibir solicitudes, resolver problemas, enviar recordatorios de pago y generar documentos.
              <p>¡Todo desde un solo lugar, sin enredos!</p>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={primaryHref}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#d4a373", color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0.85rem 2.25rem", borderRadius: "8px", textDecoration: "none", transition: "background-color 150ms" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#C4915F")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d4a373")}>
                {primaryLabel} →
              </Link>
              {!isLoggedIn && (
                <Link href="/login"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#faedcd", color: "#2C2416", fontWeight: 500, fontSize: "0.9375rem", padding: "0.85rem 2rem", borderRadius: "8px", border: "1px solid #E8DECE", textDecoration: "none", transition: "background-color 150ms" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e9edc9")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#faedcd")}>
                  Ya tengo cuenta
                </Link>
              )}
            </div>

            {/* <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#A8957D" }}>Sin tarjeta de crédito · Gratis para empezar · Listo en 2 minutos</p> */}
          </div>

          {/* Mockup */}
          <div className="mx-auto mt-20" style={{ maxWidth: "56rem", backgroundColor: "#faedcd", border: "1px solid #E8DECE", borderRadius: "16px", padding: "1rem", boxShadow: "0 8px 32px rgba(44,36,22,0.10)" }}>
            <div style={{ backgroundColor: "#e9edc9", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ height: 40, backgroundColor: "#fefae0", borderBottom: "1px solid #E8DECE", display: "flex", alignItems: "center", padding: "0 1rem", gap: "0.5rem" }}>
                {["#E07B54","#d4a373","#7CAE7A"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c, display: "inline-block" }} />)}
              </div>
              <div style={{ display: "flex", height: 260 }}>
                <div style={{ width: 160, backgroundColor: "#e9edc9", borderRight: "1px solid #E8DECE", padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }} className="hidden sm:flex">
                  <div style={{ height: 16, backgroundColor: "#d4a373", borderRadius: 4, width: "60%", marginBottom: 8, opacity: 0.8 }} />
                  {["#d4a373","#7CAE7A","#6B9AB8","#E07B54"].map((c,i) => (
                    <div key={c} style={{ height: 30, backgroundColor: i===0?"#fefae0":"transparent", borderRadius: 6, display: "flex", alignItems: "center", padding: "0 0.5rem", gap: "0.5rem" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: c, display: "inline-block" }} />
                      <div style={{ height: 8, backgroundColor: "#C8B99A", borderRadius: 3, flex: 1, opacity: 0.6 }} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {([["#ccd5ae","#3D5A1A"],["#faedcd","#8B5E1A"],["#e9edc9","#2C4A6E"]] as [string,string][]).map(([bg,fg],i) => (
                      <div key={i} style={{ flex: 1, height: 64, backgroundColor: bg, border: "1px solid #E8DECE", borderRadius: 8, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                        <div style={{ height: 7, backgroundColor: fg, borderRadius: 2, width: "50%", opacity: 0.4 }} />
                        <div style={{ height: 12, backgroundColor: fg, borderRadius: 2, width: "35%", opacity: 0.7 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, backgroundColor: "#fefae0", border: "1px solid #E8DECE", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: 32, backgroundColor: "#faedcd", borderBottom: "1px solid #E8DECE", display: "flex", alignItems: "center", padding: "0 0.75rem", gap: "1rem" }}>
                      {["45%","20%","25%"].map((w,i) => <div key={i} style={{ height: 7, backgroundColor: "#C8B99A", borderRadius: 2, width: w, opacity: 0.6 }} />)}
                    </div>
                    {[0,1,2].map(r => (
                      <div key={r} style={{ height: 28, display: "flex", alignItems: "center", padding: "0 0.75rem", gap: "1rem", borderBottom: "1px solid #E8DECE", backgroundColor: r%2===0?"#fefae0":"#faedcd" }}>
                        <div style={{ height: 6, backgroundColor: "#C8B99A", borderRadius: 2, width: "45%", opacity: 0.5 }} />
                        <div style={{ height: 16, backgroundColor: ["#ccd5ae","#faedcd","#e9edc9"][r], borderRadius: 999, width: "20%", opacity: 0.9 }} />
                        <div style={{ height: 6, backgroundColor: "#C8B99A", borderRadius: 2, width: "25%", opacity: 0.4 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section id="como-funciona" style={{ backgroundColor: "#faedcd", borderTop: "1px solid #E8DECE", borderBottom: "1px solid #E8DECE", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 600, color: "#2C2416", marginBottom: "1rem" }}>
                ¿Cuánto tiempo pierdes buscando mensajes de hace tres semanas?
              </h2>
              <p style={{ color: "#7A6A52", fontSize: "1rem", maxWidth: "36rem", margin: "0 auto" }}>
                Si gestionas una propiedad o un equipo, ya sabes lo que cuesta el desorden. Habitta lo soluciona.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { emoji: "😤", title: "Solicitudes que se pierden",   desc: "Alguien pidió algo por WhatsApp, otra persona lo hizo por correo y nadie sabe quién lo está resolviendo.", dot: "#E07B54" },
                { emoji: "📊", title: "Datos regados por todas partes", desc: "Cinco grupos de WhatsApp, cuatro hojas de Excel y ninguna es la versión final. Eso ya no puede seguir así.",  dot: "#d4a373" },
                { emoji: "🤷", title: "Nadie sabe qué está pasando",  desc: "¿Cuántas solicitudes están abiertas? ¿Cuáles llevan más de una semana sin respuesta? Nadie lo sabe.",          dot: "#6B9AB8" },
              ].map(({ emoji, title, desc, dot }) => (
                <div key={title} style={{ backgroundColor: "#fefae0", border: "1px solid #E8DECE", borderRadius: 12, padding: "1.75rem", boxShadow: "0 1px 3px rgba(44,36,22,0.06)" }}>
                  <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "0.75rem" }}>{emoji}</span>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#7A6A52", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA (3 PASOS) ── */}
        <section style={{ backgroundColor: "#fefae0", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 600, color: "#2C2416" }}>
                Empezar es muy fácil
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map(({ num, title, desc, color }) => (
                <div key={num} className="text-center">
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.125rem", margin: "0 auto 1.25rem" }}>
                    {num}
                  </div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#7A6A52", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUÉ PUEDES HACER ── */}
        <section id="que-puedes-hacer" style={{ backgroundColor: "#faedcd", borderTop: "1px solid #E8DECE", borderBottom: "1px solid #E8DECE", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 600, color: "#2C2416" }}>
                Todo lo que puedes hacer con Habitta
              </h2>
              <p style={{ color: "#7A6A52", fontSize: "1rem", maxWidth: "34rem", margin: "1rem auto 0" }}>
                Sin tecnicismos. Sin cursos. Si sabes usar WhatsApp, sabes usar Habitta.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc, bg, dot }) => (
                <div key={title}
                  style={{ backgroundColor: bg, border: "1px solid #E8DECE", borderRadius: 12, padding: "1.5rem", transition: "box-shadow 200ms, transform 200ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(44,36,22,0.10)"; (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow="none"; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: dot }}><Icon size={18} /></div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.375rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "#7A6A52", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── IA HIGHLIGHT ── */}
        <section style={{ backgroundColor: "#fefae0", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div style={{ backgroundColor: "#2C2416", borderRadius: 16, padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem", boxShadow: "0 8px 32px rgba(44,36,22,0.15)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#d4a373", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={24} color="#fff" />
              </div>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700, color: "#fefae0", maxWidth: "30rem", lineHeight: 1.3 }}>
                Un asistente inteligente que trabaja contigo
              </h2>
              <p style={{ color: "#A8957D", fontSize: "1rem", maxWidth: "34rem", lineHeight: 1.7 }}>
                Dile al asistente lo que necesitas y él lo hace: crea una solicitud, genera un documento, le manda un mensaje a un residente. En segundos. Sin buscar menús ni llenar formularios.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4" style={{ width: "100%", maxWidth: "42rem" }}>
                {[
                  { icon: BellRing, text: "\"Envíale un recordatorio de pago a Carlos\"" },
                  { icon: FileText, text: "\"Genera el acta de la reunión de hoy\"" },
                  { icon: MessageSquareText, text: "\"Crea una solicitud de mantenimiento urgente\"" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1rem 0.875rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <Icon size={16} color="#d4a373" />
                    <p style={{ fontSize: "0.8125rem", color: "#C8B99A", lineHeight: 1.5, fontStyle: "italic" }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUIÉN ── */}
        <section id="para-quien" style={{ backgroundColor: "#e9edc9", borderTop: "1px solid #E8DECE", borderBottom: "1px solid #E8DECE", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 600, color: "#2C2416" }}>
                ¿Esto es para ti?
              </h2>
              <p style={{ color: "#7A6A52", fontSize: "1rem", maxWidth: "32rem", margin: "1rem auto 0" }}>
                Si administras personas y espacios físicos, la respuesta es sí.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {SECTORS.map(({ emoji, title, desc, accent }) => (
                <div key={title} style={{ backgroundColor: "#fefae0", border: "1px solid #E8DECE", borderLeft: `3px solid ${accent}`, borderRadius: "0 12px 12px 0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(44,36,22,0.06)" }}>
                  <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>{emoji}</span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#2C2416", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#7A6A52", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIOS ── */}
        <section style={{ backgroundColor: "#fefae0", padding: "5rem 1.5rem" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 600, color: "#2C2416" }}>
                Lo que dicen quienes ya lo usan
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map(({ text, name, role, color }) => (
                <div key={name} style={{ backgroundColor: "#faedcd", border: "1px solid #E8DECE", borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ fontSize: "0.9rem", color: "#5A4A36", lineHeight: 1.7, fontStyle: "italic" }}>{text}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "auto" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                      {name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#2C2416" }}>{name}</p>
                      <p style={{ fontSize: "0.75rem", color: "#7A6A52" }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ backgroundColor: "#faedcd", padding: "5rem 1.5rem", borderTop: "1px solid #E8DECE" }}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "#2C2416", marginBottom: "1rem" }}>
              Pruébalo hoy. Es gratis para empezar.
            </h2>
            <p style={{ color: "#7A6A52", fontSize: "1.0625rem", marginBottom: "2rem", lineHeight: 1.7 }}>
              En menos de 5 minutos tienes tu panel listo. Sin instalar nada, sin pagar por adelantado, sin complicaciones.
            </p>
            <Link href={primaryHref}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#d4a373", color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2.5rem", borderRadius: "8px", textDecoration: "none", transition: "background-color 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#C4915F")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d4a373")}>
              {primaryLabel} →
            </Link>
            {/* <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#A8957D" }}>Sin tarjeta de crédito · Listo en 2 minutos</p> */}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: "#2C2416", color: "#A8957D", padding: "2.5rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: "1.25rem", fontWeight: 700, color: "#faedcd" }}>Habitta</span>
            <p style={{ fontSize: "0.8125rem" }}>© {new Date().getFullYear()} Habitta. Todos los derechos reservados.</p>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", alignItems: "center" }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ color: "#d4a373", textDecoration: "none" }}>Mi panel</Link>
            ) : (
              <>
                <Link href="/login" style={{ color: "#A8957D", textDecoration: "none" }}>Ingresar</Link>
                <Link href="/register" style={{ color: "#d4a373", textDecoration: "none" }}>Crear cuenta gratis</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
