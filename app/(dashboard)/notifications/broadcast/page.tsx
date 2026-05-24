import { requireAuth } from "@/modules/auth/application/auth.guard";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { getActiveOrganizationId } from "@/modules/organizations/application/org.utils";
import { getBroadcastHistory, getRecipientCount } from "@/modules/notifications/application/broadcast.actions";
import { BroadcastForm } from "@/modules/notifications/components/Broadcast/BroadcastForm";
import { BroadcastHistory } from "@/modules/notifications/components/Broadcast/BroadcastHistory";

export const metadata = { title: "Broadcast — Habitta" };

interface Props {
  searchParams: Promise<{ org?: string }>;
}

export default async function BroadcastPage({ searchParams }: Props) {
  const params = await searchParams;
  const user   = await requireAuth();
  const orgId  = await getActiveOrganizationId(user.id, params.org);

  await requireOrgRole(orgId, ['owner', 'admin']);

  const [recipientCount, history] = await Promise.all([
    getRecipientCount(orgId),
    getBroadcastHistory(orgId),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Broadcast</h1>
        <p className="text-sm text-[var(--foreground)]/50 mt-0.5">
          Envía mensajes masivos por Telegram a los clientes de la organización.
        </p>
      </div>

      {/* Formulario de envío */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
        <BroadcastForm orgId={orgId} recipientCount={recipientCount} />
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Historial</h2>
          <span className="text-xs bg-[var(--surface)] text-[var(--foreground)]/40 px-2 py-0.5 rounded-full border border-[var(--border)]">
            {history.length}
          </span>
        </div>
        <BroadcastHistory items={history} />
      </div>
    </div>
  );
}
