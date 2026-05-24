'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, Home } from 'lucide-react';
import { HabittaSpinner } from '@/modules/core/components/HabittaSpinner';

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

interface PaymentSummary {
  id: string;
  resident_name: string;
  concept: string;
  amount: number;
  currency: string;
  due_date: string;
  status: string;
}

export function PayPageClient({ payment }: { payment: PaymentSummary | null }) {
  const [step, setStep] = useState<'summary' | 'confirming' | 'done'>('summary');

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <p className="font-semibold text-gray-700">Enlace de pago no válido</p>
          <p className="text-sm text-gray-400">Este enlace no existe o ya expiró.</p>
        </div>
      </div>
    );
  }

  if (payment.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="font-semibold text-gray-700">¡Este pago ya fue registrado!</p>
          <p className="text-sm text-gray-400">No tienes nada pendiente por este recibo.</p>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setStep('confirming');
    setTimeout(() => setStep('done'), 1800);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#d4a373' }}>
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">Habitta</span>
        </div>

        {step === 'summary' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: '#d4a373' }}>
              <p className="text-white font-semibold">Formulario de pago</p>
              <p className="text-white/80 text-sm mt-0.5">Revisa los datos y confirma</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Residente</span>
                  <span className="font-medium text-gray-800">{payment.resident_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Concepto</span>
                  <span className="font-medium text-gray-800">{payment.concept}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Vencimiento</span>
                  <span className="font-medium text-gray-800">
                    {new Date(payment.due_date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total a pagar</span>
                  <span className="text-xl font-bold" style={{ color: '#d4a373' }}>{formatCOP(payment.amount)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                🔒 Demo — no se realiza ningún cobro real
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#d4a373' }}
              >
                Confirmar pago
              </button>
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-12 flex flex-col items-center gap-4">
            <HabittaSpinner size={40} />
            <p className="text-sm font-medium text-gray-500">Procesando tu pago…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-gray-800 text-lg">¡Pago exitoso!</p>
              <p className="text-sm text-gray-400">{formatCOP(payment.amount)} registrado correctamente</p>
              <p className="text-xs text-gray-300 mt-2">Puedes cerrar esta ventana.</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-5">Habitta · Sistema de gestión residencial</p>
      </div>
    </div>
  );
}
