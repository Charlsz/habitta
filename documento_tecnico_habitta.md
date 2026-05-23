# Documento técnico de Habitta

## Visión general

Habitta es una plataforma SaaS de gestión operativa y administrativa diseñada para centralizar solicitudes, incidencias, tareas, agenda, responsables, activos y trazabilidad dentro de organizaciones que administran espacios físicos, propiedades, proyectos o sedes. El planteamiento parte de un caso de uso residencial, pero la arquitectura funcional y técnica se concibe desde el inicio como un sistema modular aplicable también a inmobiliarias, constructoras, edificios corporativos, viviendas propias, operaciones multisede y otros nichos con necesidades similares de coordinación y seguimiento.

La oportunidad del producto nace de un problema repetido en operaciones reales: muchos procesos todavía se manejan con WhatsApp, llamadas, hojas de cálculo y canales dispersos, lo que dificulta la trazabilidad, la asignación de responsables, el control de estados, la visibilidad de pendientes y la toma de decisiones. El valor central de Habitta es convertir esas interacciones informales en flujos estructurados con tickets, estados, agenda, evidencias, comentarios, respuestas y métricas visibles para cada organización.

## Objetivo del producto

El objetivo principal de Habitta es ofrecer una base tecnológica única para administrar operación y solicitudes en distintos contextos, sin limitarse a un solo nicho. En lugar de construir herramientas separadas para cada vertical, la plataforma utiliza un núcleo común de entidades, permisos, reglas de negocio y módulos configurables que pueden adaptarse según el tipo de cliente.

Desde la perspectiva del negocio, Habitta busca convertirse en una capa operativa para organizaciones que necesitan registrar eventos, ordenar solicitudes, programar actividades, controlar aprobaciones y mantener historial de todo lo que sucede sobre un activo, una unidad, un sitio o una sede. Esto permite que la solución tenga un alcance más amplio que un software de administración residencial tradicional.

## Problema que resuelve

En el sector residencial, el documento base identifica problemas como dificultad para saber qué propiedades están al día o en mora, gestión desordenada de PQR, solicitudes de mudanza o reservas sin control centralizado, baja visibilidad operativa y falta de trazabilidad en pagos, reclamos, reservas y solicitudes. 

Ese mismo patrón puede abstraerse a otros sectores: en una constructora puede existir desorden en novedades por obra, tareas pendientes, mantenimientos, cronogramas y responsables; en una inmobiliaria puede ocurrir lo mismo con incidencias de inmuebles, solicitudes de arrendatarios, seguimiento a mantenimientos o estados operativos. Por ello, Habitta se define mejor como una plataforma para transformar operación dispersa en operación estructurada.  

## Propuesta de valor

La propuesta de valor de Habitta consiste en capturar solicitudes desde distintos canales, organizarlas bajo una estructura común y permitir que cada organización opere sobre ellas con reglas claras. Cada caso puede tener tipo, categoría, prioridad, responsable, activo relacionado, estado, fechas, comentarios, evidencias y resolución final.  

La plataforma entrega valor en cinco niveles:

- Centralización de la operación en un solo sistema. 
- Trazabilidad completa de cada solicitud o evento.  
- Configuración por nicho sin cambiar el núcleo técnico. 
- Visibilidad operativa por medio de dashboards, filtros y estados.  
- Escalabilidad hacia modelos multi-sede o multi-organización desde etapas tempranas.  

## Enfoque conceptual del sistema

Habitta no debe modelarse únicamente como “software para edificios”, sino como un motor administrativo y operativo para entidades administrables. En el documento inicial ya existe una intención de escalabilidad mediante una entidad tipo `ResidentialComplex` y una arquitectura modular preparada para soportar múltiples conjuntos en el futuro; esa base puede evolucionarse a una entidad más amplia, por ejemplo `Organization`, `Site`, `Project` o `ManagedSpace`, según la estrategia final del producto.  

Bajo este enfoque, el sistema puede especializarse por configuración sin alterar su esencia. Un ticket puede representar una PQR en residencial, una novedad de obra en construcción, una incidencia de arrendamiento en inmobiliaria o una solicitud de mantenimiento en una vivienda propia administrada digitalmente.  

## Nichos objetivo

Habitta está pensado para atender múltiples nichos con un mismo núcleo funcional. Los principales nichos iniciales que la plataforma puede comunicar son los siguientes:

| Nicho | Ejemplos de uso en Habitta | Encaje con el núcleo |
|---|---|---|
| Conjuntos y edificios residenciales | PQR, mudanzas, reservas, parqueos, cartera, mantenimiento | Muy alto    |
| Inmobiliarias | Incidencias por inmueble, solicitudes de arrendatarios, seguimiento a mantenimiento | Alto, reutiliza tickets, activos, agenda y responsables   |
| Constructoras | Novedades por obra, pendientes, cronogramas, incidencias, responsables por sitio | Alto, reutiliza tickets, tareas, agenda, evidencia y dashboards   |
| Viviendas propias o administradores independientes | Control de propiedades, mantenimientos, pagos, solicitudes y seguimiento | Alto, reutiliza activos, eventos y estado operativo    |
| Operaciones multisede | Solicitudes por sede, tareas de mantenimiento, responsables, indicadores y trazabilidad | Alto, aprovecha modelo multi-organización y dashboards   |

## Tipos de usuarios

El documento base define inicialmente dos perfiles principales: administrador y propietario, con permisos diferenciados y control de acceso por roles.  

Para la versión ampliada de Habitta, el modelo de usuarios debe crecer hacia un sistema RBAC más flexible, incorporando actores como superadministrador, operador, residente, arrendatario, interventor, encargado de mantenimiento, coordinador de obra o cliente final. La base ya contempla autenticación segura, identificación de roles, restricción de rutas y validación de permisos también desde backend, lo que facilita esta evolución.  

## Casos de uso transversales

Los siguientes casos de uso resumen el patrón operativo que Habitta busca resolver en distintos nichos:

- Crear solicitudes, incidencias o tickets asociados a un activo, propiedad, obra o sede.  
- Asignar responsables y cambiar estados según el flujo operativo.  
- Programar eventos y actividades con fecha y rango horario.  
- Aprobar o rechazar solicitudes de acuerdo con reglas del negocio.  
- Adjuntar imágenes u otras evidencias para soporte del caso.  
- Visualizar indicadores operativos en dashboards administrativos.  
- Mantener notificaciones internas relacionadas con cambios de estado o nuevos eventos.  
- Conservar trazabilidad e historial por entidad, usuario y acción.  

## Módulos funcionales

### 1. Autenticación y autorización

Este módulo controla el acceso mediante correo y contraseña, identifica el rol del usuario, restringe acciones por permisos y protege rutas privadas. El documento base recomienda JWT, refresh tokens, bcrypt y validación de permisos también en backend.  

### 2. Gestión de organizaciones o espacios administrables

En el diseño original existe la entidad `ResidentialComplex`, recomendada desde etapas tempranas para preparar el sistema hacia un modelo multi-conjunto. Para la nueva visión, esta entidad debe generalizarse de modo que represente el contenedor principal de operación: conjunto, obra, inmobiliaria, sede, proyecto o espacio administrado.  

Campos sugeridos:

- id
- name
- type
- address
- city
- phone
- email
- status
- createdAt
- updatedAt

### 3. Gestión de activos o unidades

En el sistema original, las propiedades representan apartamentos, casas, locales o unidades privadas, con datos como torre, número, tipo, valor de administración, estado y mora. En la evolución del producto, este módulo debe ampliarse para representar cualquier unidad operable: inmueble, apartamento, local, parqueadero, zona, frente de obra, bloque, torre o sede interna.  

Campos sugeridos:

- id
- organizationId
- code
- name
- assetType
- location
- status
- ownerOrResponsibleId
- metadata
- createdAt
- updatedAt

### 4. Gestión de usuarios y relaciones

El documento original propone una tabla de usuarios y una tabla intermedia para relación entre propietarios y propiedades, permitiendo que un propietario tenga varias propiedades y que una propiedad pueda tener uno o varios propietarios si se requiere. Ese patrón es útil para generalizar relaciones entre usuarios y activos administrados.  

Este módulo debe soportar:

- Usuarios internos y externos.
- Relación flexible entre usuarios y activos.
- Distinción entre propietario, ocupante, residente, encargado o responsable.
- Asociación primaria y secundaria.
- Estado de acceso o vinculación.

### 5. Motor de tickets y solicitudes

Este es el núcleo estratégico de Habitta. El módulo base de PQR ya contiene una estructura valiosa con código, usuario, propiedad asociada, categoría, descripción, imagen, estado, respuesta administrativa y fechas. Esa estructura debe convertirse en un motor más amplio de tickets reutilizable en múltiples nichos.  

Tipos posibles de ticket:

- PQR
- Incidencia
- Mantenimiento
- Novedad de obra
- Solicitud administrativa
- Requerimiento documental
- Solicitud de visita
- Queja operativa

Campos sugeridos:

- id
- code
- organizationId
- assetId
- requesterUserId
- assignedUserId
- categoryId
- type
- priority
- title
- description
- evidenceUrl
- status
- dueDate
- response
- createdAt
- updatedAt
- closedAt

Estados sugeridos:

- abierta
- en revisión
- en proceso
- en espera
- resuelta
- rechazada
- cerrada

### 6. Agenda y programación operativa

Los módulos originales de mudanzas y reservas muestran que el sistema ya contempla solicitudes con fecha, hora de inicio, hora de finalización, observaciones, aprobación y reglas de cruce horario. Esa lógica puede unificarse en un módulo más general de agenda operativa.  

Este módulo debe permitir:

- Crear actividades programadas.
- Asociar la actividad a un activo, sitio o zona.
- Aprobar o rechazar eventos según reglas de disponibilidad.
- Evitar cruces de horario cuando aplique.  
- Registrar observaciones y respuesta administrativa.  

Ejemplos de uso:

- Reserva de zona común.
- Solicitud de mudanza.
- Mantenimiento programado.
- Inspección técnica.
- Visita de contratista.
- Hito de obra.

### 7. Notificaciones

El documento original recomienda notificaciones internas para nueva PQR creada, solicitud de mudanza enviada, reserva enviada, cambios de estado, pagos registrados y alertas de mora. Este módulo debe mantenerse como capa transversal de comunicación de eventos dentro de la plataforma.  

### 8. Dashboard y analítica operativa

La plataforma debe ofrecer dashboards con indicadores claros, rápidos y útiles. El documento original ya define un dashboard administrativo con tarjetas resumen, tablas, filtros y visualización de pendientes, PQR, solicitudes y estado financiero, así como un dashboard personalizado para el propietario.  

En la nueva versión, los dashboards deben configurarse por nicho, pero compartir una base común de métricas:

- Tickets abiertos por estado.
- Tiempo promedio de atención.
- Solicitudes pendientes por responsable.
- Eventos próximos en agenda.
- Activos con mayor volumen de incidencias.
- Indicadores de cartera o pagos, si el módulo financiero está activo.  

### 9. Pagos y cartera

El documento técnico base incluye módulos de administración, cobros, estado de pago, cálculo de mora e integración potencial con pasarelas como Wompi, Mercado Pago o PayU. Sin embargo, también aclara que la integración real de pagos puede postergarse para no retrasar el lanzamiento.  

Por ello, en Habitta este módulo debe ser opcional y desacoplado del núcleo operativo. Puede activarse en clientes donde sea relevante, pero el valor principal del producto no debe depender de esta capacidad.  

## Arquitectura funcional propuesta

Habitta debe construirse como una plataforma modular por dominio. El documento original ya recomienda una estructura backend por módulos, con separación clara entre autenticación, usuarios, propiedades, pagos, PQR, reservas, mudanzas, dashboard y notificaciones, lo que encaja bien con la visión ampliada del producto.  

Una arquitectura funcional recomendada sería la siguiente:

| Dominio | Responsabilidad principal |
|---|---|
| Auth | Acceso, sesiones, permisos y seguridad    |
| Organizations | Conjuntos, obras, sedes, proyectos o espacios administrados   |
| Assets | Unidades, inmuebles, zonas, bloques, frentes o activos    |
| Users | Usuarios internos y externos    |
| Relationships | Asociación entre usuarios y activos   |
| Tickets | Solicitudes, PQR, incidencias y seguimiento    |
| Scheduling | Agenda, reservas, eventos y programación    |
| Notifications | Alertas internas y eventos del sistema    |
| Billing | Cobros, pagos, cartera y mora, cuando aplique    |
| Dashboard | Indicadores, tablas, filtros y reportes visuales    |

## Arquitectura técnica recomendada

El documento base recomienda React o Next.js con TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Table, Recharts, TanStack Query y Zustand para el frontend. Para backend recomienda NestJS con TypeScript, PostgreSQL, Prisma, JWT, bcrypt y validación con DTOs, además de una estructura modular por dominio.  

Con base en ello, la arquitectura técnica sugerida para Habitta es:

### Frontend

- Next.js o React con Vite.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.
- TanStack Table.
- Recharts.
- TanStack Query.
- Zustand.  

### Backend

- Node.js.
- NestJS.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- JWT y refresh tokens.
- bcrypt.
- class-validator.
- class-transformer.  

### Infraestructura

- Frontend desplegado en Vercel. 
- Backend desplegado en VPS con Docker y Nginx, o infraestructura administrada equivalente. 
- Base de datos en Supabase PostgreSQL o servicio administrado similar, evitando alojar la base crítica directamente en VPS en producción inicial. 
- Storage en Supabase Storage, Cloudinary, S3 o equivalente para evidencias y archivos.  

## Integraciones futuras

Una de las líneas más potentes para Habitta es la captura multicanal. Aunque el documento base menciona WhatsApp como parte del problema operativo actual y sugiere que las notificaciones externas pueden agregarse en fases posteriores, la visión del producto puede crecer hacia conectores que conviertan mensajes o solicitudes externas en tickets estructurados dentro del sistema.  

Integraciones futuras sugeridas:

- WhatsApp para creación o actualización de tickets. 
- Correo electrónico para recepción de casos. 
- Pasarelas de pago para clientes que manejen cartera.  
- Calendarios externos para sincronización de eventos.
- Servicios de monitoreo y logging como Sentry.
- Redis y BullMQ para colas, automatizaciones y procesos asíncronos. 

## Reglas de negocio clave

Las reglas de negocio ya documentadas para el caso residencial son útiles porque revelan el patrón operativo del sistema. Entre las más importantes están la restricción de acceso por rol, la validación de propiedad de los datos, la obligación de asociar ciertas solicitudes a una propiedad del usuario, la prevención de cruces de horario en reservas y mudanzas, y la conservación de trazabilidad en acciones relevantes.  

Para la visión ampliada de Habitta, las reglas generales deberían ser:

- Todo ticket debe pertenecer a una organización y a un solicitante válido.
- Si el ticket afecta un activo específico, debe asociarse a ese activo.
- Los usuarios solo pueden consultar información que corresponda a sus permisos.  
- Los eventos agendados no deben solaparse cuando la regla de negocio lo prohíba.  
- Toda acción relevante debe quedar registrada en historial.
- Los archivos adjuntos deben validarse por tipo y tamaño. 
- La visibilidad del dashboard debe depender del rol y del alcance del usuario.  

## Modelo de datos base

Un modelo de datos inicial para Habitta podría incluir las siguientes entidades principales:

| Entidad | Propósito |
|---|---|
| User | Representa a los usuarios del sistema    |
| Role | Define permisos y perfiles    |
| Organization | Representa el espacio administrado, generalizando `ResidentialComplex`    |
| Asset | Representa una unidad, propiedad o activo gestionable    |
| UserAssetRelation | Relación entre usuarios y activos, basada en el patrón `PropertyOwner`    |
| Ticket | Generalización del módulo PQR    |
| TicketCategory | Clasificación de tickets    |
| ScheduleEvent | Generalización de reservas, mudanzas y eventos operativos    |
| Notification | Notificaciones internas    |
| Charge | Cobros o cargos, cuando el módulo financiero esté activo    |
| Payment | Pagos y conciliación, si aplica    |
| AuditLog | Historial de cambios y trazabilidad |
| Attachment | Evidencias y archivos asociados |

## Alcance del MVP para hackathon

Para una hackathon, el producto no debe intentar mostrar todas las industrias en profundidad, sino demostrar un motor transversal con un caso claro. El caso residencial sigue siendo útil como demostración porque es fácil de entender y ya tiene flujos bien definidos en el documento base, como PQR, reservas, mudanzas, notificaciones y dashboard.  

El MVP recomendado para una presentación de hackathon incluye:

- Login y roles.  
- Organización o espacio administrado.
- Activos o propiedades.
- Creación de tickets con evidencia.  
- Vista administrativa de tickets.  
- Cambio de estado y respuesta administrativa.  
- Agenda operativa básica.  
- Dashboard con métricas de tickets y solicitudes.  
- Demostración conceptual de escalabilidad hacia otros nichos.  

## Por qué Habitta puede ser una idea ganadora

Habitta tiene potencial porque combina tres cualidades que rara vez aparecen juntas en un MVP de hackathon: un problema fácil de entender, una solución demostrable en un caso real y una arquitectura suficientemente abstracta como para crecer a múltiples nichos. El documento base ya sostiene la parte técnica con enfoque modular, escalable y mantenible, y los módulos funcionales muestran que el patrón operativo ya está bien identificado.  

La fortaleza diferencial del proyecto no está en una sola función aislada, sino en la capacidad de convertir operación informal en gestión estructurada. Esa promesa es relevante para residencial, inmobiliario, construcción y operaciones multisede, lo que permite presentar Habitta como una plataforma con impacto potencial amplio y no como una herramienta cerrada para un único mercado.  

## Recomendaciones finales

Para mantener coherencia entre la visión amplia y el desarrollo real, Habitta debería seguir estas recomendaciones:

- Nombrar las entidades principales con lenguaje transversal, aunque el demo use ejemplos residenciales. 
- Diseñar el módulo de tickets como núcleo central del producto.  
- Mantener pagos como módulo opcional, no como centro del MVP.  
- Construir dashboards y vistas reutilizables por configuración.  
- Preparar el modelo de datos para múltiples organizaciones o sitios desde el inicio.  
- Priorizar trazabilidad, estados, responsables y agenda como diferenciadores principales.  

## Conclusión

Habitta debe definirse técnicamente como una plataforma SaaS modular de gestión operativa y administrativa para espacios, activos y organizaciones. Su valor inicial puede demostrarse en el contexto residencial, pero su arquitectura, sus reglas y sus módulos están mejor posicionados si se conciben desde el principio como un sistema adaptable a múltiples verticales con un mismo núcleo funcional.  
