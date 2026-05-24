import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { createClient } from "@/lib/supabase/server";
import { getPayments } from "@/modules/payments/application/payments.actions";
import { PaymentsClient } from "@/modules/payments/presentation/PaymentsClient";

const PAYMENT_ORG_TYPES = ["residential", "real_estate", "conjuntos", "inmobiliaria", "propiedad_horizontal"];

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const user    = await requireAuth();
  const sp      = await searchParams;
  const orgId   = sp.org;

  if (!orgId) redirect("/organizations");

  const supabase = await createClient();

  // Verify membership + org type
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, type)")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!membership) redirect("/organizations");

  const org = membership.organizations as any;
  if (!PAYMENT_ORG_TYPES.includes(org.type)) redirect(`/dashboard?org=${orgId}`);

  const payments = await getPayments(orgId).catch(() => []);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            💳 Pagos
          </h1>
          <p className="text-sm text-[var(--foreground)]/50 mt-0.5">{org.name} — módulo de cobros residenciales</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Demo</span>
      </div>

      <PaymentsClient initialPayments={payments} orgId={orgId} />
    </div>
  );
}
