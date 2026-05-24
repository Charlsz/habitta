"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Send, AlertTriangle, Clock, CreditCard, RefreshCw } from "lucide-react";
import { HabittaSpinner } from "@/modules/core/components/HabittaSpinner";
import { markPaymentPaid, sendTelegramReminder, seedDemoPayments, type Payment } from "@/modules/payments/application/payments.actions";

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
}

function StatusBadge({ status, days }: { status: Payment["status"]; days: number }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <CheckCircle className="w-3 h-3" /> Pagado
    </span>
  );
  if (status === "overdue") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <AlertTriangle className="w-3 h-3" /> Vencido
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      days <= 3 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
    }`}>
      <Clock className="w-3 h-3" /> {days <= 0 ? "Hoy" : `${days}d`}
    </span>
  );
}

type ModalStep = "confirm" | "processing" | "success";

function PaymentModal({ payment, orgId, onClose, onPaid }: {
  payment: Payment;
  orgId: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("confirm");
  const [, startT] = useTransition();

  const handlePay = () => {
    setStep("processing");
    startT(async () => {
      await new Promise((r) => setTimeout(r, 1800));
      await markPaymentPaid(payment.id, orgId);
      setStep("success");
      setTimeout(onPaid, 1500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && step !== "processing") onClose(); }}
    >
      <div className="bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-md mx-4 overflow-hidden">

        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: "#d4a373" }}>
          <CreditCard className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold">Procesar pago</h2>
        </div>

        <div className="px-6 py-6">
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border)] p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Residente</span>
                  <span className="font-medium">{payment.resident_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Concepto</span>
                  <span className="font-medium">{payment.concept}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Vencimiento</span>
                  <span className="font-medium">{new Date(payment.due_date + "T00:00:00").toLocaleDateString("es-CO")}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg" style={{ color: "#d4a373" }}>{formatCOP(payment.amount)}</span>
                </div>
              </div>

              <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--foreground)]/50">
                🔒 Demo — no se procesa ningún cobro real
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--sidebar-bg)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePay}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#d4a373" }}
                >
                  Confirmar pago
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#d4a37318" }}>
                <HabittaSpinner size={40} />
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]/70">Procesando pago…</p>
              <p className="text-xs text-[var(--foreground)]/40">Por favor espera</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-emerald-700">¡Pago exitoso!</p>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">{formatCOP(payment.amount)} registrado correctamente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentsClient({ initialPayments, orgId }: { initialPayments: Payment[]; orgId: string }) {
  const [payments, setPayments]         = useState<Payment[]>(initialPayments);
  const [selectedPayment, setSelected]  = useState<Payment | null>(null);
  const [reminderStates, setReminder]   = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [seedPending, startSeed]        = useTransition();

  const pending      = payments.filter((p) => p.status === "pending");
  const overdue      = payments.filter((p) => p.status === "overdue");
  const paid         = payments.filter((p) => p.status === "paid");
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0);

  const handlePaid = () => {
    setPayments((prev) => prev.map((p) =>
      p.id === selectedPayment?.id ? { ...p, status: "paid" as const, paid_at: new Date().toISOString() } : p
    ));
    setSelected(null);
  };

  const handleReminder = async (payment: Payment) => {
    setReminder((prev) => ({ ...prev, [payment.id]: "sending" }));
    const res = await sendTelegramReminder(payment.id, orgId);
    setReminder((prev) => ({ ...prev, [payment.id]: res.ok ? "sent" : "error" }));
    setTimeout(() => setReminder((prev) => ({ ...prev, [payment.id]: "idle" })), 3000);
  };

  const handleSeed = () => {
    startSeed(async () => {
      await seedDemoPayments(orgId);
      window.location.reload();
    });
  };

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: "#d4a37320" }}>💳</div>
        <div className="text-center">
          <p className="font-semibold text-[var(--foreground)]">Sin pagos registrados</p>
          <p className="text-sm text-[var(--foreground)]/50 mt-1">Genera datos de demostración para explorar el módulo</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seedPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#d4a373" }}
        >
          {seedPending ? <HabittaSpinner size={18} /> : <RefreshCw className="w-4 h-4" />}
          Generar pagos demo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Por cobrar",    value: formatCOP(totalPending), color: "#3b82f6", count: pending.length },
          { label: "Vencidos",      value: formatCOP(totalOverdue), color: "#ef4444", count: overdue.length },
          { label: "Pagados",       value: String(paid.length),     color: "#10b981", count: paid.length,     isCount: true },
          { label: "Total recibos", value: String(payments.length), color: "#d4a373", count: payments.length, isCount: true },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs text-[var(--foreground)]/50 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            {!kpi.isCount && <p className="text-xs text-[var(--foreground)]/40 mt-0.5">{kpi.count} recibos</p>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--background)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recibos de pago</h2>
          <button
            onClick={handleSeed}
            disabled={seedPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:bg-[var(--sidebar-bg)] transition-colors disabled:opacity-50"
          >
            {seedPending ? <HabittaSpinner size={14} /> : <RefreshCw className="w-3 h-3" />}
            Regenerar demo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--sidebar-bg)]">
                {["Residente", "Concepto", "Monto", "Vencimiento", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]/50 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {payments.map((p) => {
                const days = daysUntil(p.due_date);
                const rs   = reminderStates[p.id] ?? "idle";
                return (
                  <tr key={p.id} className="hover:bg-[var(--sidebar-bg)]/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.resident_name}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]/70">{p.concept}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "#d4a373" }}>{formatCOP(p.amount)}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]/60">{new Date(p.due_date + "T00:00:00").toLocaleDateString("es-CO")}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} days={days} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.status !== "paid" && (
                          <button
                            onClick={() => setSelected(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "#d4a373" }}
                          >
                            <CreditCard className="w-3 h-3" /> Pagar
                          </button>
                        )}
                        {p.status !== "paid" && (
                          <button
                            onClick={() => handleReminder(p)}
                            disabled={rs === "sending"}
                            title={p.telegram_chat_id ? "Enviar reminder por Telegram" : "Sin Telegram configurado — se enviará igual como demo"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              rs === "sent"    ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                              rs === "error"   ? "bg-red-50 border-red-200 text-red-700" :
                              rs === "sending" ? "opacity-60 border-[var(--border)]" :
                              "border-[var(--border)] hover:bg-[var(--sidebar-bg)]"
                            }`}
                          >
                            {rs === "sending" ? <HabittaSpinner size={14} /> :
                             rs === "sent"    ? <CheckCircle className="w-3 h-3" /> :
                             rs === "error"   ? <AlertTriangle className="w-3 h-3" /> :
                                               <Send className="w-3 h-3" />}
                            {rs === "sent" ? "Enviado" : rs === "error" ? "Error" : "Telegram"}
                          </button>
                        )}
                        {p.status === "paid" && (
                          <span className="text-xs text-[var(--foreground)]/40">Pagado {p.paid_at ? new Date(p.paid_at).toLocaleDateString("es-CO") : ""}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          orgId={orgId}
          onClose={() => setSelected(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}
