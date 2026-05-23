"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, X, Ticket, Calendar, Building, LayoutDashboard, Users, Paperclip, ChevronRight 
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-[#FAFAF8]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-indigo-700">
                Habitta
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8 items-center">
              <a href="#como-funciona" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Cómo funciona</a>
              <a href="#caracteristicas" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Características</a>
              <a href="#sectores" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">Sectores</a>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold text-zinc-700 hover:text-indigo-600 transition-colors">
                Ingresar
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                Empezar gratis
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-indigo-600 hover:bg-zinc-50">Cómo funciona</a>
              <a href="#caracteristicas" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-indigo-600 hover:bg-zinc-50">Características</a>
              <a href="#sectores" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-indigo-600 hover:bg-zinc-50">Sectores</a>
              <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50 text-center border border-zinc-200">
                  Ingresar
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 text-center">
                  Empezar gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 mb-8 mt-4 sm:mt-0">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              Plataforma operativa inteligente
            </div>
            
            <h1 className="max-w-4xl mx-auto text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
              Convierte tu operación dispersa en <span className="text-indigo-600">gestión estructurada</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-zinc-600 sm:text-xl">
              Habitta centraliza tus solicitudes, tickets, activos y agenda sin importar el tamaño de tu organización. Vuelve la paz mental a tu equipo.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 focus:outline-none hover:scale-105 active:scale-95">
                Empezar gratis hoy
              </Link>
              <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white border border-zinc-200 px-8 py-3.5 text-base font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-indigo-600 hover:border-indigo-200">
                Ver demo <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* MOCKUP VISUAL ABTRACTO */}
            <div className="mt-20 mx-auto max-w-5xl rounded-2xl bg-white p-2 sm:p-4 shadow-2xl border border-zinc-200/60 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden flex flex-col h-64 sm:h-96">
                {/* Mockup Header */}
                <div className="h-12 border-b border-zinc-200 bg-white flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                </div>
                {/* Mockup Body */}
                <div className="flex flex-1 p-4 gap-4">
                  {/* Sidebar mockup */}
                  <div className="hidden sm:flex w-48 flex-col gap-3">
                    <div className="w-full h-8 bg-zinc-200 rounded-md"></div>
                    <div className="w-3/4 h-8 bg-zinc-100 rounded-md"></div>
                    <div className="w-5/6 h-8 bg-zinc-100 rounded-md"></div>
                  </div>
                  {/* Content mockup */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1 h-20 bg-white border border-zinc-200 rounded-lg shadow-sm flex items-center px-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full"></div>
                        <div className="ml-4 flex-col gap-2 flex">
                          <div className="w-16 h-3 bg-zinc-100 rounded"></div>
                          <div className="w-8 h-4 bg-zinc-300 rounded"></div>
                        </div>
                      </div>
                      <div className="flex-1 h-20 bg-white border border-zinc-200 rounded-lg shadow-sm flex items-center px-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full"></div>
                        <div className="ml-4 flex-col gap-2 flex">
                          <div className="w-20 h-3 bg-zinc-100 rounded"></div>
                          <div className="w-8 h-4 bg-zinc-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-white border border-zinc-200 rounded-lg shadow-sm p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-5 bg-zinc-200 rounded"></div>
                      <div className="w-full h-10 bg-zinc-50 rounded border border-zinc-100"></div>
                      <div className="w-full h-10 bg-zinc-50 rounded border border-zinc-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA / PROBLEMA */}
        <section id="como-funciona" className="py-24 bg-white border-y border-zinc-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                ¿Tu operación todavía vive en WhatsApp y hojas de cálculo?
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                La comunicación desordenada cuesta tiempo, dinero y clientes. Habitta resuelve el caos operativo de raíz.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Point 1 */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-zinc-100 text-center">
                <div className="mx-auto w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                  <X className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">Sin trazabilidad</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Las solicitudes se pierden, nadie sabe quién está haciendo qué, ni el estado actual de un requerimiento.
                </p>
              </div>
              {/* Point 2 */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-zinc-100 text-center">
                <div className="mx-auto w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">Sin centralización</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Datos dispersos en 5 chats diferentes, docenas de correos y archivos de Excel desactualizados.
                </p>
              </div>
              {/* Point 3 */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-zinc-100 text-center">
                <div className="mx-auto w-14 h-14 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">Sin visibilidad</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Gerenciar a ciegas. No hay métricas claras de resolución, tiempos de respuesta ni volumen de operación.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CARACTERÍSTICAS */}
        <section id="caracteristicas" className="py-24 bg-[#FAFAF8]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Todo lo que necesitas para operar con claridad
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Feat 1 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Tickets y solicitudes</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Crea, asigna y da seguimiento a incidencias, prioridades y estados, todo en un solo tablero organizado.
                </p>
              </div>
              
              {/* Feat 2 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Agenda operativa</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Programa eventos, controla reservas y mantenimientos con nuestro validador anti-cruces de fechas.
                </p>
              </div>

              {/* Feat 3 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Gestión de activos</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Administra tu inventario, propiedades, zonas físicas o cualquier recurso operativo de manera central.
                </p>
              </div>

              {/* Feat 4 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Dashboard en tiempo real</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  KPIs instantáneos. Mantén la vista en lo importante: cuellos de botella e incidencias abiertas.
                </p>
              </div>

              {/* Feat 5 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Control por roles</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Multi-empresa nativa (Multi-tenant). Administradores, miembros y clientes ven exactamente lo que deben ver.
                </p>
              </div>

              {/* Feat 6 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-5">
                  <Paperclip className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Adjuntos y evidencias</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Sube fotos, PDFs e imágenes como evidencia al resolver tickets. Todo respaldado en la nube.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTORES */}
        <section id="sectores" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-12 text-center">
              Diseñado para múltiples sectores
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
              
              <div className="p-6 bg-zinc-50 border-l-4 border-l-indigo-500 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Conjuntos residenciales</h3>
                <p className="text-zinc-600">Sistema completo para PQRs, reservas de zonas comunes, control de novedades y comunicación con residentes.</p>
              </div>

              <div className="p-6 bg-zinc-50 border-l-4 border-l-orange-500 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Constructoras</h3>
                <p className="text-zinc-600">Reporte de novedades de obra, seguimiento fotográfico a incidencias y control de equipos por proyecto cerrado.</p>
              </div>

              <div className="p-6 bg-zinc-50 border-l-4 border-l-green-500 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Inmobiliarias</h3>
                <p className="text-zinc-600">Canaliza de forma profesional los mantenimientos locativos de tus arrendatarios a los proveedores técnicos.</p>
              </div>

              <div className="p-6 bg-zinc-50 border-l-4 border-l-blue-500 rounded-r-xl shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Operaciones multisede</h3>
                <p className="text-zinc-600">Supervisa sucursales a nivel nacional, teniendo KPIs claros de resolución de problemas desde la gerencia general.</p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-indigo-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
              Empieza a operar con orden hoy
            </h2>
            <p className="text-indigo-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
              Únete a docenas de empresas que dejaron atrás el estrés del desorden y abrazaron la eficiencia de Habitta.
            </p>
            <div className="flex justify-center">
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-md transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-900 text-zinc-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-2xl font-black tracking-tight text-white">Habitta</span>
            <p className="text-sm">© {new Date().getFullYear()} Habitta. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
