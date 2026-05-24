'use client';

import { useState, useActionState, useEffect } from 'react';
import { createAssetAction, updateAssetAction, deleteAssetAction } from '../application/asset.actions';

interface Asset {
  id:          string;
  name:        string;
  code:        string | null;
  asset_type:  string;
  location:    string | null;
  description: string | null;
  status:      string;
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  unit:        '🏠 Apartamento / Unidad',
  parking:     '🚗 Parqueadero',
  storage:     '📦 Bodega',
  commercial:  '🏪 Local comercial',
  common_area: '🌿 Área común',
  other:       '📌 Otro',
};

const FIELD = 'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]';
const LABEL = 'block text-xs font-medium text-[var(--muted)] mb-1';

function AssetForm({
  organizationId,
  asset,
  onClose,
}: {
  organizationId: string;
  asset?: Asset;
  onClose: () => void;
}) {
  const isEdit = !!asset;
  const boundAction = isEdit
    ? updateAssetAction.bind(null, asset!.id)
    : createAssetAction;

  const [state, formAction, isPending] = useActionState(boundAction as any, {});

  useEffect(() => {
    if (state && !state.error && Object.keys(state).length === 0) onClose();
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
      <input type="hidden" name="organization_id" value={organizationId} />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {isEdit ? '✏️ Editar unidad' : '➕ Nueva unidad'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Nombre *</label>
          <input name="name" required defaultValue={asset?.name} className={FIELD}
            placeholder="Apto 301, Local 4..."
          />
        </div>
        <div>
          <label className={LABEL}>Código / Referencia</label>
          <input name="code" defaultValue={asset?.code ?? ''} className={FIELD}
            placeholder="301, L-04..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tipo</label>
          <select name="asset_type" defaultValue={asset?.asset_type ?? 'unit'} className={FIELD}>
            {Object.entries(ASSET_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Ubicación / Torre</label>
          <input name="location" defaultValue={asset?.location ?? ''} className={FIELD}
            placeholder="Torre A, Piso 3..."
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Descripción (opcional)</label>
        <input name="description" defaultValue={asset?.description ?? ''} className={FIELD}
          placeholder="Apartamento 3 habitaciones con balcón..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--foreground)]/60 hover:border-[#d4a373] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#d4a373' }}>
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear unidad'}
        </button>
      </div>
    </form>
  );
}

export function AssetManager({
  organizationId,
  initialAssets,
}: {
  organizationId: string;
  initialAssets:  Asset[];
}) {
  const [assets, setAssets]         = useState<Asset[]>(initialAssets);
  const [showForm, setShowForm]     = useState(false);
  const [editingAsset, setEditing]  = useState<Asset | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta unidad? Si tiene clientes asignados, puede causar errores.')) return;
    setDeletingId(id);
    await deleteAssetAction(id, organizationId);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">🏢 Unidades registradas</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Aquí registras los espacios físicos de tu propiedad: apartamentos, locales, parqueaderos, etc.
            Una vez creados, puedes asignarlos a clientes y vincularlos a tickets y citas.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold shrink-0"
            style={{ backgroundColor: '#d4a373' }}
          >
            + Nueva unidad
          </button>
        )}
      </div>

      {/* Formulario inline */}
      {(showForm || editingAsset) && (
        <AssetForm
          organizationId={organizationId}
          asset={editingAsset}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}

      {/* Lista */}
      {assets.length === 0 && !showForm ? (
        <div className="text-center py-8 text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
          <p className="text-2xl mb-2">🏗️</p>
          <p>Aún no has registrado ninguna unidad.</p>
          <p className="text-xs mt-1">Crea la primera para poder asignarla a clientes.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {assets.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--background)] hover:bg-[var(--surface)] transition-colors">
              <span className="text-lg">{ASSET_TYPE_LABELS[a.asset_type]?.charAt(0) ?? '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}{a.code ? ` (${a.code})` : ''}</p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  {a.location ? ` · ${a.location}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setEditing(a); setShowForm(false); }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:border-[#d4a373] text-[var(--foreground)]/60 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
