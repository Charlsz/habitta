import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationAIContext } from '@/modules/dashboard/application/ai-assistant.actions';

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('org') ?? undefined;
    const context = await getOrganizationAIContext(orgId);
    if (!context) return NextResponse.json({ ok: false, error: 'No context' }, { status: 404 });

    // Serialize into a compact string the Edge Function can inject into its system prompt
    const clientLines = (context.clients ?? []).map((c: any) =>
      `- ${c.full_name} | ${c.relation_type ?? '-'} | ${c.status} | email: ${c.email ?? '-'} | tel: ${c.phone ?? '-'} | doc: ${c.document_type ?? '-'} ${c.document_number ?? '-'} | ingreso: ${c.move_in_date ?? '-'}${c.move_out_date ? ` | salida: ${c.move_out_date}` : ''}${c.notes ? ` | notas: ${c.notes}` : ''}`
    ).join('\n');

    const ticketLines = (context.allTickets ?? []).slice(0, 80).map((t: any) =>
      `- [${t.status}] "${t.title}" | tipo: ${t.type} | prioridad: ${t.priority} | ${new Date(t.created_at).toLocaleDateString('es-CO')}${t.description ? ` | desc: ${t.description.slice(0, 80)}` : ''}`
    ).join('\n');

    const assetLines = (context.assets ?? []).map((a: any) =>
      `- ${a.name}${a.code ? ` (${a.code})` : ''} | tipo: ${a.type ?? '-'} | estado: ${a.status ?? '-'}`
    ).join('\n');

    const eventLines = (context.events ?? []).slice(0, 30).map((e: any) =>
      `- [${e.status}] "${e.title}" | ${new Date(e.start_time).toLocaleDateString('es-CO')}${e.description ? ` | ${e.description.slice(0, 60)}` : ''}`
    ).join('\n');

    const serialized = `ORGANIZACIÓN: ${context.org?.name} (${context.org?.type ?? '-'}, ${context.org?.city ?? '-'})

CLIENTES (${context.clientCounts.total} total | activos: ${context.clientCounts.active} | inactivos: ${context.clientCounts.inactive}):
${clientLines || 'Sin clientes.'}

UNIDADES (${context.assets?.length ?? 0}):
${assetLines || 'Sin unidades.'}

TICKETS (${context.counts.total} total | abiertos: ${context.counts.open} | en progreso: ${context.counts.in_progress} | resueltos: ${context.counts.resolved}):
${ticketLines || 'Sin tickets.'}

AGENDA (${context.eventCounts.total} eventos | pendientes: ${context.eventCounts.pending} | aprobados: ${context.eventCounts.approved}):
${eventLines || 'Sin eventos.'}`;

    return NextResponse.json({ ok: true, context: serialized, orgName: context.org?.name });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
