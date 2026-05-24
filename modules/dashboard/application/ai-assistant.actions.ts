"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Obtiene el contexto de IA para una org específica.
 * Si no se pasa orgId, usa la primera org del usuario (fallback).
 */
export async function getOrganizationAIContext(orgId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  let resolvedOrgId = orgId;

  // Si no se pasó orgId explícito, tomar la primera membership del usuario
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

  // Verificar que el usuario pertenece a esa org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name, type, city)")
    .eq("user_id", user.id)
    .eq("organization_id", resolvedOrgId)
    .maybeSingle();

  if (!membership) return null;

  const org = membership.organizations as any;

  // Tickets recientes (últimos 30)
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, title, type, priority, status, created_at, updated_at")
    .eq("organization_id", resolvedOrgId)
    .order("created_at", { ascending: false })
    .limit(30);

  // Todos los tickets para conteos
  const { data: allTickets } = await supabase
    .from("tickets")
    .select("type, priority, status, created_at")
    .eq("organization_id", resolvedOrgId);

  const counts = {
    total: allTickets?.length ?? 0,
    open: allTickets?.filter((t) => t.status === "open").length ?? 0,
    in_progress: allTickets?.filter((t) => t.status === "in_progress").length ?? 0,
    closed: allTickets?.filter((t) => t.status === "closed").length ?? 0,
    urgent: allTickets?.filter((t) => t.priority === "urgent" && t.status !== "closed").length ?? 0,
    high: allTickets?.filter((t) => t.priority === "high" && t.status !== "closed").length ?? 0,
    byType: [
      "incidencia", "mantenimiento", "novedad_obra", "pqr",
      "solicitud_administrativa", "solicitud_visita", "queja_operativa", "requerimiento_documental",
    ].map((type) => ({
      type,
      count: allTickets?.filter((t) => t.type === type).length ?? 0,
    })),
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const ticketsThisMonth = allTickets?.filter((t) => t.created_at >= startOfMonth) ?? [];

  return {
    org,
    orgId: resolvedOrgId,
    counts,
    ticketsThisMonth: ticketsThisMonth.length,
    recentTickets: tickets ?? [],
  };
}

export async function askAIAssistant(
  messages: { role: string; content: string }[],
  context: Awaited<ReturnType<typeof getOrganizationAIContext>>
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurado");

  const systemPrompt = `Eres el asistente de análisis interno de Habitta para la organización *${
    context?.org?.name ?? "desconocida"
  }*. Tu única función es responder preguntas sobre los datos de tickets y operaciones de esta organización.

## DATOS ACTUALES DE LA ORGANIZACIÓN

**Resumen de tickets:**
- Total: ${context?.counts.total}
- Abiertos: ${context?.counts.open}
- En progreso: ${context?.counts.in_progress}
- Cerrados: ${context?.counts.closed}
- Urgentes activos: ${context?.counts.urgent}
- Alta prioridad activos: ${context?.counts.high}
- Creados este mes: ${context?.ticketsThisMonth}

**Tickets por tipo:**
${context?.counts.byType.map((t: any) => `- ${t.type}: ${t.count}`).join("\n")}

**Últimos 30 tickets (título | tipo | prioridad | estado | fecha):**
${context?.recentTickets
  .map((t: any) => `- "${t.title}" | ${t.type} | ${t.priority} | ${t.status} | ${new Date(t.created_at).toLocaleDateString("es-CO")}`)
  .join("\n")}

## REGLAS
- Solo responde preguntas sobre estos datos o la operación de ${context?.org?.name}.
- Si te preguntan algo fuera de este scope responde: "Solo puedo ayudarte con información sobre los tickets y operaciones de ${context?.org?.name}."
- Responde siempre en español, de forma concisa y útil.
- Puedes hacer cálculos, comparaciones y resúmenes basados en los datos anteriores.`;

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
