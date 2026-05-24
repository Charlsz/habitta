'use client';

import { useState, useTransition } from 'react';
import { updateAssetAction, deleteAssetAction, createAssetAction } from '../application/asset.actions';
import {
  ASSET_TYPE_LABELS,
  ASSET_TYPE_ICONS,
  getAssetTypesForOrg,
  getOrgAssetContext,
  type AssetType,
  type AssetInsert,
} from '../domain/asset.schema';

interface Asset {
  id:          string;
  name:        string;
  code:        string | null;
  asset_type:  AssetType;
  location:    string | null;
  description: string | null;
  status:      string;
}

const FIELD = 'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]';
const LABEL = 'block text-xs font-medium text-[var(--muted)] mb-1';

function AssetForm({
  organizationId,
  orgType,
  asset,
  onClose,
  onSaved,
}: {
  organizationId: string;
  orgType?:       string | null;
  asset?:         Asset;
  onClose:        () => void;
  onSaved:        (saved: Asset) => void;
}) {
  const isEdit   = !!asset;
  const ctx      = getOrgAssetContext(orgType);
  const types    = getAssetTypesForOrg(orgType);
  const [error, setError]    = useState<string | null>(null);
  const [isPending, startTx] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd        = new FormData(e.currentTarget);
    const name      = (fd.get('name') as string).trim();
    const assetType = (fd.get('asset_type') as AssetType) || ctx.defaultType;
    const code      = (fd.get('code') as string) || null;
    const location  = (fd.get('location') as string) || null;
    const desc      = (fd.get('description') as string) || null;

    if (!name) { setError('El nombre es obligatorio'); return; }
    setError(null);

    startTx(async () => {
      if (isEdit) {
        const res = await updateAssetAction(asset!.id, organizationId, {
          name, code, asset_type: assetType, location, description: desc,
        });
        if (res?.error) { setError(res.error); return; }
        onSaved({ ...asset!, name, code, asset_type: assetType, location, description: desc });
      } else {
        const data: AssetInsert = {
          organization_id: organizationId,
          name,
          code:        code ?? `ESP-${Date.now()}`,
          asset_type:  assetType,
          location,
          description: desc,
          status:      'active',
        };
        const res = await createAssetAction(data);
        if (res?.error) { setError(res.error); return; }
        onSaved({
          id: '',
          ...data,
          code:        data.code ?? null,
          location:    data.location ?? null,
          description: data.description ?? null,
          status:      'active',
          asset_type:  assetType,
        });
      }
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {isEdit ? `✏️ Editar ${ctx.entityLabel.toLowerCase()}` : `➕ Nuevo ${ctx.entityLabel.toLowerCase()}`}
      </p>

      {/* Nombre y Código */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Nombre *</label>
          <input name="name" required defaultValue={asset?.name} className={FIELD}
            placeholder={ctx.namePlaceholder} />
        </div>
        <div>
          <label className={LABEL}>Código / Referencia</label>
          <input name="code" defaultValue={asset?.code ?? ''} className={FIELD}
            placeholder={ctx.codePlaceholder} />
        </div>
      </div>

      {/* Tipo y Ubicación */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tipo</label>
          <select name="asset_type" defaultValue={asset?.asset_type ?? ctx.defaultType} className={FIELD}>
            {types.map((v) => (
              <option key={v} value={v}>
                {ASSET_TYPE_ICONS[v]} {ASSET_TYPE_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Ubicación</label>
          <input name="location" defaultValue={asset?.location ?? ''} className={FIELD}
            placeholder={ctx.locationPlaceholder} />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className={LABEL}>Descripción (opcional)</label>
        <input name="description" defaultValue={asset?.description ?? ''} className={FIELD}
          placeholder={`Información adicional sobre este ${ctx.entityLabel.toLowerCase()}...`} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--foreground)]/60 hover:border-[#d4a373] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#d4a373' }}>
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : `Crear ${ctx.entityLabel.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}

export function AssetManager({
  organizationId,
  orgType,
  initialAssets,
}: {
  organizationId: string;
  orgType?:       string | null;
  initialAssets:  Asset[];
}) {
  const ctx                                    = getOrgAssetContext(orgType);
  const [assets, setAssets]                    = useState<Asset[]>(initialAssets);
  const [showForm, setShowForm]                = useState(false);
  const [editingAsset, setEditing]             = useState<Asset | undefined>();
  const [deletingId, setDeleting]              = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Eliminar este ${ctx.entityLabel.toLowerCase()}? Si tiene clientes o tickets asignados puede causar errores.`)) return;
    setDeleting(id);
    const res = await deleteAssetAction(id, organizationId);
    if (!res?.error) setAssets(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  };

  const handleSaved = (saved: Asset) => {
    setAssets(prev => {
      const idx = prev.findIndex(a => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx]  = saved;
        return next;
      }
      // Si es nuevo, recargamos lista desde el server en el próximo render
      // (revalidatePath ya se llama en la action)
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {ctx.headerEmoji} {ctx.entityLabelPlural} registrados
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 max-w-lg">
            {ctx.moduleDescription}
          </p>
        </div>
        {!showForm && !editingAsset && (
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold shrink-0"
            style={{ backgroundColor: '#d4a373' }}>
            + {ctx.entityLabel} nuevo
          </button>
        )}
      </div>

      {/* Formulario */}
      {(showForm || editingAsset) && (
        <AssetForm
          organizationId={organizationId}
          orgType={orgType}
          asset={editingAsset}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
          onSaved={handleSaved}
        />
      )}

      {/* Lista vacía */}
      {assets.length === 0 && !showForm && !editingAsset ? (
        <div className="text-center py-8 text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
          <p className="text-2xl mb-2">{ctx.headerEmoji}</p>
          <p>{ctx.emptyText}</p>
        </div>
      ) : (
        /* Lista de espacios */
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {assets.map((a) => (
            <div key={a.id}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--background)] hover:bg-[var(--surface)] transition-colors">
              <span className="text-base shrink-0">{ASSET_TYPE_ICONS[a.asset_type] ?? '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {a.name}{a.code ? ` (${a.code})` : ''}
                </p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  {a.location ? ` · ${a.location}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { setEditing(a); setShowForm(false); }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:border-[#d4a373] text-[var(--foreground)]/60 transition-colors">
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                  {deletingId === a.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
