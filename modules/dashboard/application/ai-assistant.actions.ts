"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrganizationAIContext(orgId?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  let resolvedOrgId = orgId;

  if (!resolvedOrgId) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    resolvedOrgId = membership?.organization_id;
  }

  if (!resolvedOrgId) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name, type, city)")
    .eq("user_id", user.id)
    .eq("organization_id", resolvedOrgId)
    .maybeSingle();

  if (!membership) return null;
  const org = membership.organizations as any;

  // ── Tickets ─────────────────────────────────────────────────────────────
  const { data: allTickets } = await supabase
    .from("tickets")
    .select("id, title, type, priority, status, description, created_at, updated_at")
    .eq("organization_id", resolvedOrgId)
    .order("created_at", { ascending: false });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const counts = {
    total:       allTickets?.length ?? 0,
    open:        allTickets?.filter((t) => t.status === "open").length ?? 0,
    in_progress: allTickets?.filter((t) => t.status === "in_progress").length ?? 0,
    on_hold:     allTickets?.filter((t) => t.status === "on_hold").length ?? 0,
    resolved:    allTickets?.filter((t) => t.status === "resolved").length ?? 0,
    closed:      allTickets?.filter((t) => t.status === "closed").length ?? 0,
    rejected:    allTickets?.filter((t) => t.status === "rejected").length ?? 0,
    urgent:      allTickets?.filter((t) => t.priority === "urgent" && t.status !== "closed").length ?? 0,
    high:        allTickets?.filter((t) => t.priority === "high"   && t.status !== "closed").length ?? 0,
    thisMonth:   allTickets?.filter((t) => t.created_at >= startOfMonth).length ?? 0,
    byType: [
      "incidencia","mantenimiento","novedad_obra","pqr",
      "solicitud_administrativa","solicitud_visita","queja_operativa","requerimiento_documental",
    ].map((type) => ({
      type,
      count: allTickets?.filter((t) => t.type === type).length ?? 0,
    })),
  };

  // ── Clientes ─────────────────────────────────────────────────────────────
  const { data: clients } = await supabase
    .from("residents")
    .select("id, full_name, email, phone, status, relation_type, move_in_date, move_out_date, document_type, document_number, notes")
    .eq("organization_id", resolvedOrgId)
    .order("full_name", { ascending: true });

  const clientCounts = {
    total:    clients?.length ?? 0,
    active:   clients?.filter((c) => c.status === "active").length ?? 0,
    inactive: clients?.filter((c) => c.status === "inactive").length ?? 0,
  };

  // ── Assets / Unidades ────────────────────────────────────────────────────
  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, code, type, status, metadata")
    .eq("organization_id", resolvedOrgId)
    .order("name", { ascending: true });

  // ── Agenda / Eventos ─────────────────────────────────────────────────────
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, status, start_time, end_time")
    .eq("organization_id", resolvedOrgId)
    .order("start_time", { ascending: false })
    .limit(50);

  const eventCounts = {
    total:     events?.length ?? 0,
    pending:   events?.filter((e) => e.status === "pending").length ?? 0,
    approved:  events?.filter((e) => e.status === "approved").length ?? 0,
    completed: events?.filter((e) => e.status === "completed").length ?? 0,
    rejected:  events?.filter((e) => e.status === "rejected").length ?? 0,
  };

  // ── Broadcasts ───────────────────────────────────────────────────────────
  const { data: broadcasts } = await supabase
    .from("broadcast_messages")
    .select("id, message, sent_at, recipient_count, status")
    .eq("organization_id", resolvedOrgId)
    .order("sent_at", { ascending: false })
    .limit(20);

  return {
    org,
    orgId: resolvedOrgId,
    // tickets
    counts,
    allTickets: allTickets ?? [],
    // clientes
    clientCounts,
    clients: clients ?? [],
    // assets
    assets: assets ?? [],
    // agenda
    eventCounts,
    events: events ?? [],
    // broadcasts
    broadcasts: broadcasts ?? [],
  };
}

export async function askAIAssistant(
  messages: { role: string; content: string }[],
  context: Awaited<ReturnType<typeof getOrganizationAIContext>>
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurado");

  const orgName = context?.org?.name ?? "la organización";

  // ── Serializar datos para el prompt ──────────────────────────────────────
  const ticketLines = (context?.allTickets ?? [])
    .slice(0, 60)
    .map((t: any) =>
      `- [${t.status}] "${t.title}" | tipo: ${t.type} | prioridad: ${t.priority} | ${new Date(t.created_at).toLocaleDateString("es-CO")}`
    ).join("\n");

  const clientLines = (context?.clients ?? [])
    .map((c: any) =>
      `- ${c.full_name} (${c.relation_type ?? "—"}) | ${c.status} | email: ${c.email ?? "—"} | tel: ${c.phone ?? "—"} | ingreso: ${c.move_in_date ?? "—"}${c.move_out_date ? ` | salida: ${c.move_out_date}` : ""}`
    ).join("\n");

  const assetLines = (context?.assets ?? [])
    .map((a: any) =>
      `- ${a.name}${a.code ? ` (${a.code})` : ""} | tipo: ${a.type ?? "—"} | estado: ${a.status ?? "—"}`
    ).join("\n");

  const eventLines = (context?.events ?? [])
    .slice(0, 30)
    .map((e: any) =>
      `- [${e.status}] "${e.title}" | ${new Date(e.start_time).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}`
    ).join("\n");

  const broadcastLines = (context?.broadcasts ?? [])
    .map((b: any) =>
      `- "${b.message?.slice(0, 80)}..." | ${b.recipient_count ?? 0} destinatarios | ${b.sent_at ? new Date(b.sent_at).toLocaleDateString("es-CO") : "—"}`
    ).join("\n");

  const systemPrompt = `Eres el asistente interno de Habitta para la organización **${orgName}**.
Tu función es responder cualquier pregunta sobre los datos de esta organización: clientes, unidades, tickets, agenda y broadcasts.
Hoy es ${now().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TICKETS (${context?.counts.total} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estado: abiertos ${context?.counts.open} | en progreso ${context?.counts.in_progress} | en espera ${context?.counts.on_hold} | resueltos ${context?.counts.resolved} | cerrados ${context?.counts.closed} | rechazados ${context?.counts.rejected}
Prioridad activa: urgentes ${context?.counts.urgent} | alta ${context?.counts.high}
Este mes: ${context?.counts.thisMonth}

Por tipo:
${context?.counts.byType.map((t: any) => `  ${t.type}: ${t.count}`).join("\n")}

Lista (hasta 60 más recientes):
${ticketLines || "Sin tickets."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 CLIENTES (${context?.clientCounts.total} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Activos: ${context?.clientCounts.active} | Inactivos: ${context?.clientCounts.inactive}

${clientLines || "Sin clientes registrados."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 UNIDADES / ACTIVOS (${context?.assets.length} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${assetLines || "Sin unidades registradas."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 AGENDA (${context?.eventCounts.total} eventos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pendientes: ${context?.eventCounts.pending} | Aprobados: ${context?.eventCounts.approved} | Completados: ${context?.eventCounts.completed} | Rechazados: ${context?.eventCounts.rejected}

${eventLines || "Sin eventos."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 BROADCASTS (últimos ${context?.broadcasts.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${broadcastLines || "Sin broadcasts enviados."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS:
- Responde siempre en español, de forma clara y concisa.
- Puedes hacer cálculos, listados, comparaciones y resúmenes con todos los datos anteriores.
- Si te preguntan algo completamente ajeno a ${orgName} o a Habitta, responde: "Solo tengo información sobre ${orgName}."
- Nunca inventes datos que no estén en el contexto.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://habitta.app",
      "X-Title": "Habitta Dashboard AI",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.2,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No pude generar una respuesta.";
}

function now() {
  return new Date();
}
