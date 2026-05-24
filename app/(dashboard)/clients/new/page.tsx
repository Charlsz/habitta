import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { createClient as createSupabase } from '@/lib/supabase/server';
import { ClientForm } from '@/modules/clients/components/ClientForm';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ org?: string }>;
}

export default async function NewClientPage({ searchParams }: Props) {
  const user   = await requireAuth();
  const params = await searchParams;
  const orgId  = await getActiveOrganizationId(user.id, params.org);
  const supabase = await createSupabase();

  const [{ data: assets }, { data: chatSessions }] = await Promise.all([
    supabase.from('assets').select('id, name, code').eq('organization_id', orgId).order('name'),
    supabase.from('chat_sessions').select('id, display_name, telegram_username')
      .eq('organization_id', orgId).order('created_at', { ascending: false }),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)] mb-5">
        <Link href={`/clients?org=${orgId}`} className="hover:text-[#d4a373]">Clientes</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Nuevo cliente</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Nuevo cliente</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Registra un cliente y vinculalo a su unidad.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <ClientForm
          organizationId={orgId}
          assets={assets ?? []}
          chatSessions={chatSessions ?? []}
        />
      </div>
    </div>
  );
}
