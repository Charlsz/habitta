'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  clientId:   string;
  clientName: string;
  orgId:      string;
  isInactive: boolean;
}

export function DeactivateClientButton({ clientId, clientName, orgId, isInactive }: Props) {
  const [open, setOpen]         = useState(false);
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const router                  = useRouter();

  async function handleDeactivate() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from('residents')
      .update({ status: 'inactive', move_out_date: date })
      .eq('id', clientId);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setOpen(false);
    router.push(`/clients?org=${orgId}`);
    router.refresh();
  }

  async function handleReactivate() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from('residents')
      .update({ status: 'active', move_out_date: null })
      .eq('id', clientId);
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.refresh();
  }

  // Reactivar es simple — solo un botón
  if (isInactive) {
    return (
      <button
        onClick={handleReactivate}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-sm border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
      >
        {loading ? 'Reactivando...' : 'Reactivar cliente'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg text-sm border border-[var(--border)] text-[var(--foreground)]/50 hover:border-red-300 hover:text-red-600 transition-colors"
      >
        Desactivar
      </button>

      {/* Modal de confirmación */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--background)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-semibold text-[var(--foreground)]">Desactivar cliente</h3>
            <p className="text-sm text-[var(--foreground)]/60">
              <strong>{clientName}</strong> quedará como inactivo pero su historial se mantiene intacto.
            </p>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]/50 mb-1">Fecha de salida</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
