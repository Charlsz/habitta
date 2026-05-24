"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ─────────────────────────────────────────────────────────────────────────
export type AIOperation = {
  table: string;
  type: "update" | "insert" | "delete";
  match?: Record<string, unknown>;
  payload?: Record<string, unknown>;
};

export type AIActionResponse = {
  type: "action";
  description: string;
  confirmation_message: string;
  operations: AIOperation[];
  undo_operations: AIOperation[];
};

export type AIAnswerResponse = {
  type: "answer";
  content: string;
};

export type AIResponse = AIActionResponse | AIAnswerResponse;

// ─── getOrganizationAIContext ──────────────────────────────────────────────────────────
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

  const { data: clients } = await supabase
    .from("residents")
    .select("id, full_name, email, phone, status, relation_type, move_in_date, move_out_date, document_type, document_number, notes, metadata")
    .eq("organization_id", resolvedOrgId)
    .order("full_name", { ascending: true });

  const clientCounts = {
    total:    clients?.length ?? 0,
    active:   clients?.filter((c) => c.status === "active").length ?? 0,
    inactive: clients?.filter((c) => c.status === "inactive").length ?? 0,
  };

  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, code, type, status, metadata")
    .eq("organization_id", resolvedOrgId)
    .order("name", { ascending: true });

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

  const { data: broadcasts } = await supabase
    .from("broadcast_messages")
    .select("id, message, sent_at, recipient_count, status")
    .eq("organization_id", resolvedOrgId)
    .order("sent_at", { ascending: false })
    .limit(20);

  return {
    org,
    orgId: resolvedOrgId,
    counts,
    allTickets: allTickets ?? [],
    clientCounts,
    clients: clients ?? [],
    assets: assets ?? [],
    eventCounts,
    events: events ?? [],
    broadcasts: broadcasts ?? [],
  };
}

// ─── askAIAssistant ───────────────────────────────────────────────────────────────────
export async function askAIAssistant(
  messages: { role: string; content: string }[],
  context: Awaited<ReturnType<typeof getOrganizationAIContext>>
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurado");

  const orgName = context?.org?.name ?? "la organización";
  const orgId   = context?.orgId ?? "";

  const ticketLines = (context?.allTickets ?? [])
    .slice(0, 60)
    .map((t: any) =>
      `- [${t.id}] [${t.status}] "${t.title}" | tipo: ${t.type} | prioridad: ${t.priority} | ${new Date(t.created_at).toLocaleDateString("es-CO")}`
    ).join("\n");

  const clientLines = (context?.clients ?? [])
    .map((c: any) => {
      const unit = (c.metadata as any)?.unit ?? "";
      return `- [${c.id}] ${c.full_name} (${c.relation_type ?? "—"}) | ${c.status} | email: ${c.email ?? "—"} | tel: ${c.phone ?? "—"} | doc: ${c.document_type ?? ""} ${c.document_number ?? ""} | unidad: ${unit || "—"} | ingreso: ${c.move_in_date ?? "—"}${c.move_out_date ? ` | salida: ${c.move_out_date}` : ""}`;
    }).join("\n");

  const assetLines = (context?.assets ?? [])
    .map((a: any) =>
      `- [${a.id}] ${a.name}${a.code ? ` (${a.code})` : ""} | tipo: ${a.type ?? "—"} | estado: ${a.status ?? "—"}`
    ).join("\n");

  const eventLines = (context?.events ?? [])
    .slice(0, 30)
    .map((e: any) =>
      `- [${e.id}] [${e.status}] "${e.title}" | ${new Date(e.start_time).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}`
    ).join("\n");

  const broadcastLines = (context?.broadcasts ?? [])
    .map((b: any) =>
      `- "${b.message?.slice(0, 80)}..." | ${b.recipient_count ?? 0} destinatarios | ${b.sent_at ? new Date(b.sent_at).toLocaleDateString("es-CO") : "—"}`
    ).join("\n");

  const systemPrompt = `Eres el asistente interno de Habitta para la organización **${orgName}** (ID: ${orgId}).
Respondes preguntas Y ejecutas acciones sobre la base de datos.
Hoy es ${new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

═══ ESQUEMA REAL DE TABLAS ═══

residents: id, organization_id, full_name, email, phone, document_type, document_number,
           relation_type, move_in_date, move_out_date, status, notes, metadata (jsonb)
tickets:   id, organization_id, title, type, priority, status, description
assets:    id, organization_id, name, code, type, status, metadata (jsonb)
events:    id, organization_id, title, description, status, start_time, end_time

NOTA: residents NO tiene columna unit_number. Usa metadata: {"unit": "Apto 804"}.

═══ VALORES VÁLIDOS (check constraints reales de la BD) ═══

residents.document_type : cc | ce | passport | nit | other
residents.relation_type : owner | tenant | resident | buyer | other
residents.status        : active | inactive | pending
tickets.status          : open | in_progress | on_hold | resolved | closed | rejected
tickets.priority        : low | medium | high | urgent
events.status           : pending | approved | completed | rejected

Traducción cuando el admin use términos en español:
- cédula de ciudadanía / CC  → document_type: "cc"
- cédula de extranjería / CE → document_type: "ce"
- pasaporte                   → document_type: "passport"
- propietario                 → relation_type: "owner"
- arrendatario / inquilino    → relation_type: "tenant"
- residente                   → relation_type: "resident"
- comprador                   → relation_type: "buyer"

═══ CAMPOS PERMITIDOS POR OPERACIÓN ═══

UPDATE residents : status, full_name, email, phone, document_type, document_number, relation_type, move_in_date, move_out_date, notes, metadata
UPDATE tickets   : status, priority, title, description
UPDATE events    : status
UPDATE assets    : status, name

INSERT residents (NO incluyas organization_id, se inyecta solo):
  full_name*, email, phone, document_type, document_number,
  relation_type, move_in_date (YYYY-MM-DD), move_out_date,
  status (default: active), notes, metadata

INSERT tickets : title*, type, priority, status (siempre "open"), description
INSERT assets  : name*, code, type, status

═══ DATOS ACTUALES DE LA ORG ═══

📋 TICKETS (${context?.counts.total} total)
Estado: abiertos ${context?.counts.open} | en progreso ${context?.counts.in_progress} | en espera ${context?.counts.on_hold} | resueltos ${context?.counts.resolved} | cerrados ${context?.counts.closed} | rechazados ${context?.counts.rejected}
Prioridad: urgentes ${context?.counts.urgent} | alta ${context?.counts.high} | este mes: ${context?.counts.thisMonth}
${ticketLines || "Sin tickets."}

👥 CLIENTES/RESIDENTES (${context?.clientCounts.total} total — activos: ${context?.clientCounts.active})
${clientLines || "Sin clientes registrados."}

🏠 UNIDADES / ACTIVOS
${assetLines || "Sin unidades registradas."}

📅 AGENDA
${eventLines || "Sin eventos."}

📢 BROADCASTS
${broadcastLines || "Sin broadcasts enviados."}

═══ FORMATO DE RESPUESTA ═══

Siempre responde JSON puro (sin bloques de código, sin texto extra).

Respuesta informativa: {"type":"answer","content":"texto"}

Acción (pide confirmación, no ejecutes sin que el admin confirme):
{
  "type": "action",
  "description": "breve descripción",
  "confirmation_message": "Detalla exactamente qué se creará o modificará",
  "operations": [
    {
      "table": "residents",
      "type": "insert",
      "payload": {
        "full_name": "Carlos Andres Galvis Pajaro",
        "email": "cgalvis21_@hotmail.com",
        "phone": "3166610293",
        "document_type": "cc",
        "document_number": "1043638251",
        "relation_type": "resident",
        "move_in_date": "2025-05-24",
        "status": "active",
        "notes": "Tiene una mascota: perro",
        "metadata": {"unit": "Apto 804", "floor": "8", "building": "Pajaro"}
      }
    }
  ],
  "undo_operations": []
}

REGLAS ABSOLUTAS:
- NO incluyas organization_id en payload.
- NO uses unit_number (no existe) — usa metadata.unit.
- Usa SOLO los valores exactos del check constraint (cc, ce, passport, owner, tenant, resident, buyer, other).
- Nunca inventes IDs. Solo usa IDs del contexto.`;

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
      temperature: 0.1,
      max_tokens: 1800,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const trimmed = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();

  let parsed: AIResponse;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const m = trimmed.match(/\{[\s\S]*\}/);
    try { parsed = m ? JSON.parse(m[0]) : { type: "answer", content: trimmed }; }
    catch { parsed = { type: "answer", content: trimmed }; }
  }

  if (!(parsed as any).type) parsed = { type: "answer", content: raw };
  return parsed;
}

// ─── executeAIAction ────────────────────────────────────────────────────────────────────
export async function executeAIAction(
  operations: AIOperation[],
  orgId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "Sin permisos para esta organización" };

  const ALLOWED_UPDATE: Record<string, string[]> = {
    tickets:   ["status", "priority", "title", "description"],
    residents: ["status", "full_name", "notes", "phone", "email", "document_type", "document_number", "relation_type", "move_in_date", "move_out_date", "metadata"],
    events:    ["status"],
    assets:    ["status", "name"],
  };

  const ALLOWED_INSERT: Record<string, string[]> = {
    residents: ["full_name", "email", "phone", "document_type", "document_number", "relation_type", "move_in_date", "move_out_date", "status", "notes", "metadata"],
    tickets:   ["title", "type", "priority", "status", "description"],
    assets:    ["name", "code", "type", "status"],
  };

  for (const op of operations) {
    if (op.type === "insert") {
      if (!ALLOWED_INSERT[op.table])
        return { ok: false, error: `Inserción no permitida en tabla '${op.table}'` };
      if (!op.payload)
        return { ok: false, error: "INSERT sin payload" };

      const safePayload: Record<string, unknown> = { organization_id: orgId };
      for (const key of Object.keys(op.payload)) {
        if (ALLOWED_INSERT[op.table].includes(key))
          safePayload[key] = op.payload[key];
      }

      const { error } = await supabase.from(op.table as any).insert(safePayload);
      if (error) return { ok: false, error: error.message };
      continue;
    }

    if (op.type === "update") {
      if (!ALLOWED_UPDATE[op.table])
        return { ok: false, error: `Tabla '${op.table}' no permitida` };
      if (!op.match || Object.keys(op.match).length === 0)
        return { ok: false, error: `UPDATE en '${op.table}' requiere un match (WHERE clause)` };
      if (!op.payload)
        return { ok: false, error: "UPDATE sin payload" };

      const safePayload: Record<string, unknown> = {};
      for (const key of Object.keys(op.payload)) {
        if (!ALLOWED_UPDATE[op.table].includes(key))
          return { ok: false, error: `Campo '${key}' en '${op.table}' no permitido` };
        safePayload[key] = op.payload[key];
      }

      let query = supabase.from(op.table as any).update(safePayload);
      for (const [col, val] of Object.entries(op.match))
        query = (query as any).eq(col, val);
      query = (query as any).eq("organization_id", orgId);
      const { error } = await (query as any);
      if (error) return { ok: false, error: error.message };
      continue;
    }

    if (op.type === "delete") {
      const allowedDeleteTables = ["residents", "tickets", "assets"];
      if (!allowedDeleteTables.includes(op.table))
        return { ok: false, error: `Eliminación no permitida en tabla '${op.table}'` };
      if (!op.match || Object.keys(op.match).length === 0)
        return { ok: false, error: `DELETE en '${op.table}' requiere un match` };

      let query = supabase.from(op.table as any).delete();
      for (const [col, val] of Object.entries(op.match))
        query = (query as any).eq(col, val);
      query = (query as any).eq("organization_id", orgId);
      const { error } = await (query as any);
      if (error) return { ok: false, error: error.message };
      continue;
    }
  }

  return { ok: true };
}
