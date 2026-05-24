import { requireAuth } from '@/modules/auth/application/auth.guard';
import { requireOrgRole } from '@/modules/auth/application/auth.guard';
import { redirect } from 'next/navigation';
import { getOrganizations } from '@/modules/organizations/infrastructure/organization.repository';
import { getDocumentsByOrg } from '@/modules/documents/infrastructure/document.repository';
import { DocumentsView } from '@/modules/documents/presentation/DocumentsView';

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: orgId } = await searchParams;
  if (!orgId) redirect('/organizations');

  const user = await requireAuth();
  await requireOrgRole(orgId, ['owner', 'admin', 'member']);

  const orgs = await getOrganizations(user.id);
  const currentOrg = orgs.find((o) => o.id === orgId);
  if (!currentOrg) redirect('/organizations');

  const docs = await getDocumentsByOrg(orgId).catch(() => []);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--border)] shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Documentos</h1>
        <p className="text-sm text-[var(--foreground)]/50 mt-0.5">
          Genera, descarga y comparte documentos con IA — <strong className="text-[var(--foreground)]/70">{currentOrg.name}</strong>
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <DocumentsView
          orgId={orgId}
          orgName={currentOrg.name}
          userId={user.id}
          initialDocs={docs}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
        />
      </div>
    </div>
  );
}
