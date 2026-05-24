<p align="center">
  <img src="public/habitta_icon.png" alt="Habitta" width="180" />
</p>

<h1 align="center">Habitta</h1>
<p align="center">La plataforma que le da orden a la administración de propiedades en Colombia.</p>

<p align="center">
  <a href="https://habitta.vercel.app">🌐 Ver en vivo</a> &nbsp;·&nbsp;
  <a href="#-el-problema">El problema</a> &nbsp;·&nbsp;
  <a href="#-la-solución">La solución</a> &nbsp;·&nbsp;
  <a href="#-funcionalidades">Funcionalidades</a> &nbsp;·&nbsp;
  <a href="#-stack-técnico">Stack técnico</a>
</p>

---

## 🎤 Pitch

> *Hay más de **60.000 conjuntos residenciales** registrados en Colombia¹.
> En cada uno hay un administrador. Y ese administrador hoy está gestionando quejas,
> cobros, reservas de zonas comunes y novedades de mantenimiento…
> todo por WhatsApp y Excel. No porque quiera. Sino porque no tenía nada mejor.
> **Hasta ahora.***

---

## 🔴 El problema

Imagina un lunes en la mañana. El ascensor del piso 8 está dañado. Tres residentes lo reportaron: uno por WhatsApp, otro por llamada, otro en un grupo. Nadie sabe quién lo está resolviendo. La queja del mes pasado por la misma falla sigue en un chat con 1.200 mensajes.

Eso no es un caso raro. **Eso es Colombia todos los días.**

Según el DANE, en el último año se construyeron más de **170.000 nuevas viviendas** en Colombia², la mayoría en conjuntos residenciales. Ese mercado crece, pero su forma de operar sigue siendo la misma de hace 20 años: dispersa, informal y sin trazabilidad.

### Los tres síntomas del desorden

| Problema | Qué pasa en la realidad |
|---|---|
| 😤 **Solicitudes que se pierden** | Alguien pidió algo por WhatsApp, otro por correo y nadie sabe quién lo está resolviendo |
| 📊 **Datos regados por todas partes** | Cinco grupos de chat, cuatro hojas de Excel y ninguna es la versión final |
| 🤷 **Nadie sabe qué está pasando** | ¿Cuántas solicitudes están abiertas? ¿Cuáles llevan más de una semana sin respuesta? Nadie lo sabe |

---

## 🟢 La solución

**Habitta** es la plataforma que centraliza toda la operación de una propiedad o conjunto en un solo lugar: solicitudes, agenda, activos, pagos y comunicaciones — con inteligencia artificial integrada.

Lo que nos hace únicos no es una función aislada. Es la combinación:

- 🤖 **IA que actúa, no solo que responde** — dile al asistente *"genera el acta de la reunión de hoy"* y en 30 segundos tienes el documento listo.
- 📲 **Telegram como canal nativo** — el residente no descarga ninguna app. Le llegan recordatorios, documentos y notificaciones por donde ya está.
- 🏢 **Multi-nicho desde el primer día** — conjuntos residenciales, constructoras, inmobiliarias, negocios con varias sedes. Un mismo núcleo que se adapta a todos.
- 🔍 **Trazabilidad completa** — cada solicitud tiene estado, responsable, historial y tiempo límite automático según su prioridad.
- 🗣️ **Lenguaje simple** — si sabes usar el teléfono, ya sabes usar Habitta.

---

## ✨ Funcionalidades

### 🎫 Motor de tickets
Recibe solicitudes, quejas y peticiones. Cada ticket tiene categoría, prioridad sugerida por IA, responsable asignado, tiempo límite automático e historial de auditoría completo.

### 🤖 Asistente de IA con acciones reales
Un chat embebido en el dashboard que no solo responde preguntas: **crea tickets, actualiza registros, genera documentos y navega entre secciones** — todo desde una conversación. Incluye stack de deshacer para revertir la última acción.

### 📄 Generación de documentos con IA
Seis tipos de documento listos para generar en segundos:
- Carta de paz y salvo
- Circular informativa
- Acta de reunión
- Reglamento interno
- Contrato de arrendamiento
- Comunicado oficial

Cada documento se descarga como **PDF** o se envía directo al **Telegram** del residente.

### 📲 Integración con Telegram
Vincula la cuenta del residente con un enlace único. Desde ese momento puede recibir recordatorios de pago, documentos PDF y notificaciones — sin instalar nada adicional.

### 💳 Módulo de pagos
Control de cuotas de administración por residente. Envía recordatorios de pago por Telegram con un clic. El residente confirma su pago desde una página pública sin necesidad de cuenta.

### 🏠 Gestión de activos / unidades
Registra apartamentos, parqueaderos, bodegas, áreas comunes y más. Asígnalos a residentes y vincúlalos a tickets de soporte.

### 📅 Agenda operativa
Programa visitas, mudanzas y reservas de zonas comunes. El sistema detecta automáticamente si ya hay algo agendado en ese horario.

### 📊 Dashboard en tiempo real
KPIs operativos: tickets por estado, solicitudes en riesgo de vencer, actividad reciente y métricas de resolución de la organización.

### 🔐 Control por roles
`owner`, `admin` y `member`. Cada perfil ve y puede hacer exactamente lo que le corresponde. Multi-organización nativo desde el primer commit.

---

## 🏗️ Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 — App Router, Server Actions, Turbopack |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + variables CSS propias |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Edge Functions | Supabase Edge Functions (Deno) |
| IA | OpenRouter — modelo `openai/gpt-4o` |
| Mensajería | Telegram Bot API |
| PDF | Generado en Edge Function con Deno |
| Deploy | Vercel |

---

## 🎯 ¿Para quién es Habitta?

| Sector | Por qué encaja |
|---|---|
| 🏢 Conjuntos residenciales | Gestión de PQR, reservas, pagos y comunicación con residentes |
| 🏗️ Constructoras | Novedades de obra, seguimiento fotográfico e incidencias por frente |
| 🏠 Inmobiliarias | Mantenimientos locativos, atención a arrendatarios y control de cartera |
| 🏪 Negocios multisede | Supervisión de sucursales con KPIs claros desde gerencia general |

---

## 🚀 Cómo empezar

```bash
# 1. Clona el repositorio
git clone https://github.com/Charlsz/habitta.git
cd habitta

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env.local
# Completa las claves de Supabase, OpenRouter y Telegram

# 4. Levanta el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Demo en vivo

👉 **[habitta.vercel.app](https://habitta.vercel.app)** — gratis para empezar, sin tarjeta de crédito.

---

## 📚 Fuentes de datos

1. **Conjuntos residenciales en Colombia** — Federación de Lonjas de Propiedad Raíz / estimaciones de propiedad horizontal registrada en superintendencia de notariado.
2. **170.000+ viviendas nuevas en 2024** — DANE, Boletín de Vivienda VIS y No VIS, IV trimestre 2024. [Ver fuente](https://www.dane.gov.co/files/operaciones/VISNoVIS/bol-VISNoVIS-IVtrim2024.pdf)
3. **Sector vivienda Colombia 2024-2025** — El Colombiano, *"Indicadores de vivienda siguen cayendo"*, enero 2025. [Ver fuente](https://www.elcolombiano.com/negocios/balance-sector-vivienda-2024-en-colombia-FG26466030)
4. **Administración de propiedad horizontal** — Bancolombia Blog, *"La administración de propiedad horizontal: 7 estrategias para el éxito"*, noviembre 2024. [Ver fuente](https://blog.bancolombia.com/negocios/administracion-de-propiedad-horizontal/)
5. **Perfil ocupacional administradores de propiedad horizontal** — Ministerio de Trabajo Colombia, OCUPACOL. [Ver fuente](https://ocupacol.mintrabajo.gov.co/Profile/OccupationalProfile/14391)

---

<p align="center">Hecho con ☕ y mucho TypeScript en Colombia 🇨🇴</p>
<p align="center">© 2026 Habitta. Todos los derechos reservados.</p>
