import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { getClientById } from '@/modules/clients/infrastructure/client.repository';
import { ClientForm } from '@/modules/clients/components/ClientForm';
import { createClient as createSupabase } from '@/lib/supabase/server';

interface Props {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ org?: string }>;
}

export default async function EditClientPage({ params, searchParams }: Props) {
  const user     = await requireAuth();
  const { id }   = await params;
  const { org }  = await searchParams;
  const orgId    = await getActiveOrganizationId(user.id, org);
  const supabase = await createSupabase();

  const [client, { data: assets }, { data: chatSessions }] = await Promise.all([
    getClientById(id),
    supabase.from('assets').select('id, name, code').eq('organization_id', orgId).order('name'),
    supabase.from('chat_sessions').select('id, display_name, telegram_username')
      .eq('organization_id', orgId).order('created_at', { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <nav className="text-sm text-[var(--muted)] mb-5">
        <Link href={`/clients?org=${orgId}`} className="hover:text-[#d4a373]">Clientes</Link>
        <span className="mx-2">/</span>
        <Link href={`/clients/${id}?org=${orgId}`} className="hover:text-[#d4a373]">{client.full_name}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Editar</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Editar cliente</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Modifica los datos del residente y su cuenta de Telegram.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <ClientForm
          organizationId={orgId}
          assets={assets ?? []}
          chatSessions={chatSessions ?? []}
          client={client as any}
        />
      </div>
    </div>
  );
}
