import { redirect } from 'next/navigation';
import { requireAuth } from '@/modules/auth/application/auth.guard';
import { getActiveOrganizationId } from '@/modules/organizations/application/org.utils';
import { createClient } from '@/lib/supabase/server';
import { ResidentForm } from '@/modules/residents/components/ResidentForm';

interface Props {
  searchParams: Promise<{ org?: string }>;
}

export default async function NewResidentPage({ searchParams }: Props) {
  const user = await requireAuth();
  const params = await searchParams;
  const orgId = await getActiveOrganizationId(user.id, params.org);
  const supabase = await createClient();

  const [{ data: assets }, { data: chatSessions }] = await Promise.all([
    supabase.from('assets').select('id, name, code').eq('organization_id', orgId).order('name'),
    supabase.from('chat_sessions').select('id, display_name, telegram_username').eq('organization_id', orgId).order('created_at', { ascending: false }),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Nuevo residente</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Registra un cliente o residente y vincúlalo a su unidad.</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <ResidentForm
          organizationId={orgId}
          assets={assets ?? []}
          chatSessions={chatSessions ?? []}
          onSuccess={() => { /* redirect happens via revalidatePath */ }}
        />
      </div>
    </div>
  );
}
