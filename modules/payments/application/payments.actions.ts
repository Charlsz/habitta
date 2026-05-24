"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PaymentStatus = "pending" | "paid" | "overdue";

export interface Payment {
  id: string;
  organization_id: string;
  resident_id: string | null;
  resident_name: string;
  concept: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_at: string | null;
  status: PaymentStatus;
  telegram_chat_id: string | null;
  notes: string | null;
  created_at: string;
}

// ── List payments for org ─────────────────────────────────────────────────
export async function getPayments(orgId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("organization_id", orgId)
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

// ── Mark payment as paid (demo) ───────────────────────────────────────────
export async function markPaymentPaid(paymentId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .eq("organization_id", orgId);

  if (error) throw new Error(error.message);
  revalidatePath("/payments");
  return { ok: true };
}

// ── Seed demo payments for org ────────────────────────────────────────────
export async function seedDemoPayments(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Get residents
  const { data: residents } = await supabase
    .from("residents")
    .select("id, full_name")
    .eq("organization_id", orgId)
    .eq("status", "active")
    .limit(6);

  if (!residents || residents.length === 0) return { ok: false, error: "Sin residentes activos" };

  const concepts = ["Administración", "Parqueadero", "Cuota extraordinaria", "Agua", "Gas"];
  const now = new Date();

  const rows = residents.flatMap((r: any, i: number) => {
    const base = [
      {
        organization_id: orgId,
        resident_id: r.id,
        resident_name: r.full_name,
        concept: concepts[i % concepts.length],
        amount: [320000, 150000, 500000, 85000, 120000][i % 5],
        currency: "COP",
        due_date: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString().split("T")[0],
        status: "pending",
        telegram_chat_id: null,
        notes: null,
      },
    ];
    // Add one overdue
    if (i === 0) {
      base.push({
        organization_id: orgId,
        resident_id: r.id,
        resident_name: r.full_name,
        concept: "Administración mes anterior",
        amount: 320000,
        currency: "COP",
        due_date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split("T")[0],
        status: "overdue",
        telegram_chat_id: null,
        notes: "Pago pendiente del mes anterior",
      });
    }
    return base;
  });

  const { error } = await supabase.from("payments").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/payments");
  return { ok: true };
}

// ── Send Telegram reminder via Edge Function ──────────────────────────────
export async function sendTelegramReminder(paymentId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!payment) return { ok: false, error: "Pago no encontrado" };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(`${supabaseUrl}/functions/v1/send-payment-reminder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ payment }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error ?? "Error enviando reminder" };
  return { ok: true, message: json.message };
}
