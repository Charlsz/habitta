# Documento técnico de Habitta

## Visión general

Habitta es una plataforma SaaS de gestión operativa y administrativa diseñada para centralizar solicitudes, incidencias, tareas, agenda, responsables, activos y trazabilidad dentro de organizaciones que administran espacios físicos, propiedades, proyectos o sedes. El planteamiento parte de un caso de uso residencial, pero la arquitectura funcional y técnica se concibe desde el inicio como un sistema modular aplicable también a inmobiliarias, constructoras, edificios corporativos, viviendas propias, operaciones multisede y otros nichos con necesidades similares de coordinación y seguimiento.

La oportunidad del producto nace de un problema repetido en operaciones reales: muchos procesos todavía se manejan con WhatsApp, llamadas, hojas de cálculo y canales dispersos, lo que dificulta la trazabilidad, la asignación de responsables, el control de estados, la visibilidad de pendientes y la toma de decisiones. El valor central de Habitta es convertir esas interacciones informales en flujos estructurados con tickets, estados, agenda, evidencias, comentarios, respuestas y métricas visibles para cada organización.

---

## Lo que se construyó en la Hackathon (Mayo 2026)

Durante la hackathon se partió de una base funcional ya existente (autenticación, organizaciones, tickets básicos) y se construyeron e integraron los siguientes módulos y capacidades en un solo día de desarrollo:

### 1. Asistente de IA con ejecución de acciones reales

Se implementó un asistente conversacional embebido dentro del dashboard que va más allá de responder preguntas: puede ejecutar acciones reales sobre la base de datos de la organización.

**Capacidades del asistente:**
- Crear tickets, residentes/clientes y activos directamente desde el chat.
- Actualizar campos de entidades existentes (título, estado, prioridad, descripción).
- Navegar a secciones del sistema (documentos, tickets, clientes).
- Generar documentos PDF con contexto real de la organización.
- Mantener un **stack de deshacer** (undo) para revertir la última acción ejecutada.
- Responder preguntas operativas usando el contexto de la organización activa.

**Arquitectura:**
- El asistente se alimenta del contexto de la organización (nombre, tipo, tickets recientes, residentes, activos).
- Usa **OpenRouter** con el modelo `openai/gpt-4o` (migrado desde OpenAI directo para mayor disponibilidad).
- Las acciones se ejecutan via `executeAIAction` — una server action segura que valida organización, tabla permitida y campos permitidos antes de hacer cualquier operación.
- Un **AI bridge via `localStorage`** permite que el asistente (flotante, en cualquier página) dispare instrucciones a componentes client-side en otras páginas (ej: abrir el generador de documentos con una instrucción pre-cargada).

### 2. Generación de documentos con IA

Se construyó un módulo completo de generación de documentos legales y administrativos.

**Tipos de documento disponibles:**
- Carta de paz y salvo
- Circular informativa
- Acta de reunión
- Reglamento interno
- Contrato de arrendamiento
- Comunicado oficial

**Funcionamiento:**
- El administrador elige el tipo de documento, completa parámetros opcionales y la IA genera el contenido completo usando el contexto real de la organización.
- El documento se puede descargar como **PDF** (generado en el servidor con Supabase Edge Function).
- El PDF puede enviarse directamente al Telegram del residente vinculado mediante `sendDocument` de la API de Telegram.
- El asistente principal puede activar el módulo de documentos automáticamente desde cualquier página via el bridge de `localStorage`.

### 3. Integración con Telegram

Se integró Telegram como canal de comunicación bidireccional entre la plataforma y los residentes/clientes.

**Flujos implementados:**
- **Vinculación de cuenta:** El administrador genera un enlace único de activación desde la vista de clientes o pagos. El residente hace clic, inicia el bot y su `chat_id` queda registrado automáticamente en la base de datos.
- **Recordatorios de pago:** El administrador puede enviar un mensaje de recordatorio de pago directamente al Telegram del residente con un solo clic. El mensaje incluye el monto y un enlace de pago.
- **Envío de documentos PDF:** Los documentos generados con IA pueden enviarse directamente al Telegram del residente como archivo PDF adjunto.
- **Resolución de `chat_id`:** El sistema resuelve el `chat_id` del residente desde su `chat_session` vinculada, no desde el cliente directamente, lo que permite múltiples dispositivos.

### 4. Módulo de pagos

Se construyó un módulo de cobros y cartera orientado al caso residencial, visible solo para organizaciones de tipo `residential` o `real_estate`.

**Funcionalidades:**
- Vista de pagos por cliente con estado (pendiente / pagado).
- El administrador puede editar el monto de administración de cada cliente de forma inline.
- Envío de recordatorio de pago por Telegram con un clic.
- Flujo de pago vía Telegram: en lugar de procesar el pago en la plataforma, se envía un enlace al residente para que confirme y adjunte su comprobante desde el bot.
- Página pública `/pay/[id]` para que el residente confirme su pago desde fuera del sistema.
- El módulo de pagos queda desacoplado del núcleo operativo: puede activarse o desactivarse por tipo de organización.

### 5. Gestión de activos / unidades

Se completó el módulo de activos y se integró directamente en la página de clientes para que el administrador pueda gestionar los espacios físicos de su propiedad sin salir de ese contexto.

**¿Qué es un activo en Habitta?**
Un activo representa cualquier espacio físico de la propiedad: un apartamento, un parqueadero, una bodega, un local comercial, una casa o un área común. Una vez registrado, el activo puede asignarse a un cliente, vincularse a tickets de soporte y aparecer en citas de mantenimiento.

**Tipos de activo disponibles:**
- Apartamento
- Casa
- Parqueadero
- Área común
- Oficina
- Bodega
- Lote
- Otro

**Funcionalidades del `AssetManager`:**
- Lista de todos los activos de la organización con ícono, nombre, código, tipo y ubicación.
- Creación de nuevo activo con formulario inline (sin navegación).
- Edición de activo existente con formulario inline.
- Eliminación con confirmación.
- Explicación contextual en lenguaje sencillo sobre qué es un activo y para qué sirve.
- Integrado directamente en `/clients` para reducir fricción operativa.

**Server actions implementadas:**
- `createAssetAction(data: AssetInsert)` — crea via RPC de Supabase.
- `updateAssetAction(id, orgId, fields)` — actualiza campos con admin client.
- `deleteAssetAction(id, orgId)` — elimina con validación de rol.

### 6. Prioridad automática de tickets con IA

Al crear un ticket, el sistema sugiere automáticamente la prioridad (baja / media / alta / urgente) basándose en el título y la descripción, usando IA.

**Flujo:**
- El usuario escribe el título y la descripción del ticket.
- Al salir del campo de descripción, se llama a la IA en segundo plano.
- La prioridad sugerida aparece como badge con indicador de "sugerido por IA".
- El administrador puede aceptar la sugerencia o cambiarla manualmente.
- El cambio manual de prioridad queda registrado en el historial de auditoría del ticket como evento `priority_changed`.

### 7. Control de tiempos límite en tickets

Se renombró y mejoró el sistema de SLA (Service Level Agreement) para usar lenguaje más amigable y comprensible para cualquier usuario.

**Cambios aplicados en toda la plataforma:**

| Nombre técnico anterior | Nombre nuevo en la UI |
|---|---|
| SLA | Tiempo límite |
| SLA en riesgo | Tickets en riesgo |
| SLABadge | Badge de tiempo límite |
| getSLAStatus | getDeadlineStatus |
| SLA_HOURS | DEADLINE_HOURS |
| Filtro "SLA" en tickets | Filtro "Tiempo límite" |

El sistema calcula automáticamente si un ticket está dentro del tiempo límite, en riesgo o vencido, basándose en su prioridad y fecha de creación.

### 8. Historial de auditoría por ticket

Cada ticket mantiene un historial de eventos que registra automáticamente:
- Creación del ticket
- Cambios de estado
- Cambios de prioridad (incluyendo si fue sugerido por IA o cambiado manualmente)
- Asignación de responsable
- Comentarios y respuestas

El historial se muestra en la vista de detalle del ticket con íconos, colores y descripciones en lenguaje natural.

### 9. Identidad visual y branding

- Se reemplazó el spinner genérico de Lucide por un `HabittaSpinner` personalizado con el ícono monocromático de la marca.
- El logo de Habitta aparece en el sidebar, en la pantalla de login, en el registro y como favicon del sitio.
- El tema visual usa un modo claro forzado con variables CSS propias (`--foreground`, `--background`, `--muted`, `--border`, `--surface`) para garantizar consistencia en todos los navegadores.
- Color primario de la marca: `#d4a373` (tierra cálida).

### 10. Ruta de edición de clientes

Se agregó la ruta `/clients/[id]/edit` que permite editar todos los datos de un cliente existente: nombre, email, teléfono, unidad asignada, estado y notas.

---

## Objetivo del producto

El objetivo principal de Habitta es ofrecer una base tecnológica única para administrar operación y solicitudes en distintos contextos, sin limitarse a un solo nicho. En lugar de construir herramientas separadas para cada vertical, la plataforma utiliza un núcleo común de entidades, permisos, reglas de negocio y módulos configurables que pueden adaptarse según el tipo de cliente.

Desde la perspectiva del negocio, Habitta busca convertirse en una capa operativa para organizaciones que necesitan registrar eventos, ordenar solicitudes, programar actividades, controlar aprobaciones y mantener historial de todo lo que sucede sobre un activo, una unidad, un sitio o una sede.

---

## Problema que resuelve

En el sector residencial, la plataforma resuelve la dificultad para saber qué propiedades están al día, la gestión desordenada de solicitudes, baja visibilidad operativa y falta de trazabilidad en pagos, reclamos, reservas y solicitudes.

Ese mismo patrón puede abstraerse a otros sectores: en una constructora puede existir desorden en novedades por obra, tareas pendientes, mantenimientos y cronogramas; en una inmobiliaria puede ocurrir lo mismo con incidencias de inmuebles, solicitudes de arrendatarios y seguimiento a mantenimientos.

---

## Propuesta de valor

La propuesta de valor de Habitta consiste en capturar solicitudes desde distintos canales, organizarlas bajo una estructura común y permitir que cada organización opere sobre ellas con reglas claras. La plataforma entrega valor en cinco niveles:

- Centralización de la operación en un solo sistema.
- Trazabilidad completa de cada solicitud o evento.
- Configuración por nicho sin cambiar el núcleo técnico.
- Visibilidad operativa por medio de dashboards, filtros y estados.
- Escalabilidad hacia modelos multi-sede o multi-organización desde etapas tempranas.

---

## Módulos funcionales (estado actual)

### Autenticación y autorización
Control de acceso por correo y contraseña, roles por organización (`owner`, `admin`, `member`), protección de rutas y validación de permisos en servidor.

### Gestión de organizaciones
Cada organización tiene nombre, tipo (`residential`, `real_estate`, `construction`, etc.), configuración propia y múltiples miembros con roles diferenciados.

### Gestión de activos / unidades
Registro de espacios físicos con tipo, código, ubicación y descripción. CRUD completo desde la página de clientes. Los activos se vinculan a clientes y pueden aparecer en tickets.

### Gestión de clientes / residentes
Creación, edición y listado de clientes con búsqueda por nombre, correo, teléfono, unidad y torre. Vinculación con activos, estado del cliente y conexión con Telegram.

### Motor de tickets
Tickets con título, descripción, categoría, prioridad (sugerida por IA), estado, tiempo límite, responsable y evidencia adjunta. Historial de auditoría completo por ticket.

### Agenda operativa
Programación de citas y eventos asociados a activos o clientes, con control de disponibilidad.

### Módulo de pagos
Cobros de administración, recordatorios por Telegram, edición de montos inline y flujo de confirmación de pago. Visible solo para organizaciones residenciales.

### Generación de documentos con IA
Seis tipos de documento generables con IA usando el contexto real de la organización. Exportación a PDF y envío por Telegram.

### Asistente de IA con acciones
Chat embebido que ejecuta acciones reales (crear, actualizar, navegar, generar documentos) con stack de deshacer y bridge a otros módulos.

### Integración Telegram
Vinculación de cuentas por enlace único, envío de recordatorios, documentos y notificaciones al chat del residente.

### Dashboard
KPIs operativos, tickets por estado, tiempos límite en riesgo, actividad reciente y métricas de la organización.

---

## Arquitectura técnica

### Stack principal

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + variables CSS propias |
| Formularios | React Hook Form + Zod |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Edge Functions | Supabase Edge Functions (Deno) |
| IA | OpenRouter — modelo `openai/gpt-4o` |
| Mensajería | Telegram Bot API |
| PDF | Generación en Edge Function con librería Deno |
| Deploy | Vercel |

### Estructura de módulos

```
modules/
  auth/           → Autenticación, guards, sesiones
  organizations/  → Organizaciones y roles
  assets/         → Activos/unidades (dominio, infra, presentación)
  clients/        → Clientes/residentes
  tickets/        → Motor de tickets, categorías, auditoría
  payments/       → Cobros, recordatorios, flujo Telegram
  documents/      → Generación IA + PDF + envío
  telegram/       → Vinculación de cuentas, envío de mensajes
  ai/             → Asistente conversacional, executeAIAction
  dashboard/      → KPIs, métricas, actividad reciente
```

### Patrones de arquitectura usados

- **Domain / Infrastructure / Presentation** por módulo.
- **Server Actions** para mutaciones seguras (Next.js).
- **`revalidatePath`** para refrescar datos después de acciones.
- **Admin client** (service role key) solo en server actions, nunca expuesto al cliente.
- **RLS de Supabase** como segunda capa de seguridad a nivel de base de datos.
- **RBAC propio** a nivel de aplicación complementando las políticas de Supabase.

---

## Modelo de datos principal

| Tabla | Propósito |
|---|---|
| `users` (auth.users) | Usuarios del sistema via Supabase Auth |
| `organizations` | Espacios administrados (conjuntos, obras, sedes) |
| `organization_members` | Relación usuario ↔ organización con rol |
| `assets` | Unidades, apartamentos, parqueaderos, etc. |
| `clients` | Residentes o clientes vinculados a una organización |
| `tickets` | Solicitudes, PQR, incidencias |
| `ticket_categories` | Clasificación de tickets por organización |
| `ticket_audit_log` | Historial de cambios por ticket |
| `payments` | Cobros de administración por cliente |
| `documents` | Documentos generados con IA |
| `telegram_sessions` | Vinculación chat_id ↔ cliente |
| `appointments` | Citas y eventos de agenda |

---

## Nichos objetivo

| Nicho | Encaje con el núcleo |
|---|---|
| Conjuntos y edificios residenciales | Muy alto — caso principal demostrado |
| Inmobiliarias | Alto — tickets, activos, clientes, agenda |
| Constructoras | Alto — tickets como novedades de obra, activos como frentes |
| Administradores independientes | Alto — gestión de múltiples propiedades |
| Operaciones multisede | Alto — modelo multi-organización nativo |

---

## Reglas de negocio clave

- Todo ticket debe pertenecer a una organización y a un solicitante válido.
- Los usuarios solo pueden ver y actuar sobre datos de organizaciones a las que pertenecen.
- Las acciones del asistente de IA validan organización, tabla y campos permitidos antes de ejecutar.
- El módulo de pagos solo es visible para organizaciones de tipo `residential` o `real_estate`.
- El tiempo límite de un ticket se calcula según su prioridad (urgente: 4h, alta: 24h, media: 72h, baja: 168h).
- El envío de mensajes por Telegram requiere que el cliente haya vinculado su cuenta previamente.
- Los PDFs generados con IA se almacenan en Supabase Storage antes de enviarse por Telegram.

---

## Por qué Habitta puede ser una idea ganadora

Habitta demuestra en la hackathon que es posible construir una plataforma operativa completa — con IA real, mensajería, generación de documentos, pagos y trazabilidad — en un solo día de desarrollo, gracias a una arquitectura modular bien diseñada.

La fortaleza diferencial no está en una función aislada sino en la combinación:
- **IA que actúa**, no solo que responde.
- **Telegram como canal nativo**, no como add-on.
- **Activos como eje central**, conectando clientes, tickets y pagos.
- **Lenguaje simple** en toda la UI, sin jerga técnica para el usuario final.
- **Arquitectura multi-nicho** desde el primer commit.
