import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { createClient } from "@/lib/supabase/server";
import { getPayments } from "@/modules/payments/application/payments.actions";
import { PaymentsClient } from "@/modules/payments/presentation/PaymentsClient";

const RESIDENTIAL_TYPES = ['residential', 'real_estate', 'residencial', 'inmobiliaria'];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  await requireAuth();
  const supabase = await createClient();
  const { org: orgId } = await searchParams;

  if (!orgId) redirect("/organizations");

  // Verify org exists and user is member
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, type)")
    .eq("organization_id", orgId)
    .maybeSingle();

  const org = membership?.organizations as any;

  // Guard: only residential/real_estate orgs
  if (!org || !RESIDENTIAL_TYPES.includes(org.type?.toLowerCase?.() ?? '')) {
    redirect(`/dashboard?org=${orgId}`);
  }

  const payments = await getPayments(orgId).catch(() => []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair, serif)" }}>
          Pagos
        </h1>
        <p className="text-sm text-[var(--foreground)]/50 mt-1">
          Gestiona cobros, envía recordatorios y registra pagos — <span className="font-medium">{org.name}</span>
        </p>
      </div>

      <PaymentsClient initialPayments={payments} orgId={orgId} />
    </div>
  );
}
