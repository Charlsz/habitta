import { requireAuth } from "@/modules/auth/application/auth.guard";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { getBroadcastHistory, getRecipientCount } from "@/modules/notifications/application/broadcast.actions";
import { BroadcastForm } from "@/modules/notifications/components/Broadcast/BroadcastForm";
import { BroadcastHistory } from "@/modules/notifications/components/Broadcast/BroadcastHistory";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";
import { Megaphone } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Broadcast Telegram — Habitta" };

export default async function BroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: requestedOrgId } = await searchParams;
  const user = await requireAuth();
  const orgs = await getOrganizations(user.id);

  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="habitta-title text-2xl">Sin organizaciones</h2>
        <Link href="/organizations/new" className="habitta-primary px-4 py-2">Crear Organización</Link>
      </div>
    );
  }

  const currentOrg = orgs.find((o) => o.id === requestedOrgId) ?? orgs[0];

  // Solo owners y admins pueden acceder
  const { role } = await requireOrgRole(currentOrg.id, ["owner", "admin"]);

  const [recipientCount, history] = await Promise.all([
    getRecipientCount(currentOrg.id),
    getBroadcastHistory(currentOrg.id),
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#d4a37318" }}>
            <Megaphone className="w-5 h-5" style={{ color: "#d4a373" }} />
          </div>
          <div>
            <h1 className="habitta-title text-3xl">Broadcast Telegram</h1>
            <p className="habitta-muted text-sm mt-0.5">
              Envía mensajes masivos a los residentes de <strong>{currentOrg.name}</strong>
            </p>
          </div>
        </div>
        {orgs.length > 1 && (
          <form className="habitta-card-high flex items-center gap-2 px-3 py-1.5">
            <span className="text-xs font-semibold text-[var(--muted)]">ORG:</span>
            <select name="org" defaultValue={currentOrg.id} className="text-sm font-medium outline-none bg-transparent">
              {orgs.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
            </select>
            <button type="submit" className="habitta-secondary px-2 py-1 text-xs">Ver</button>
          </form>
        )}
      </div>

      {/* Formulario */}
      <div className="habitta-card-high p-6">
        <BroadcastForm orgId={currentOrg.id} recipientCount={recipientCount} />
      </div>

      {/* Historial */}
      <div className="habitta-card-high overflow-hidden">
        <div className="p-4 border-b bg-[var(--surface)] flex items-center gap-2">
          <h3 className="font-bold text-[var(--foreground)]">Historial de broadcasts</h3>
          <span className="text-xs bg-[var(--border)] text-[var(--muted)] px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        <BroadcastHistory items={history} />
      </div>
    </div>
  );
}
