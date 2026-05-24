'use client';

import { useTransition } from 'react';
import { createResidentAction, updateResidentAction } from '../application/resident.actions';
import type { Resident, ResidentRelationType } from '../domain/resident.types';

interface Asset { id: string; name: string; code: string | null; }
interface ChatSession { id: string; display_name: string | null; telegram_username: string | null; }

interface Props {
  organizationId: string;
  assets: Asset[];
  chatSessions: ChatSession[];
  resident?: Resident;
  onSuccess?: () => void;
}

const RELATION_OPTIONS: { value: ResidentRelationType; label: string }[] = [
  { value: 'resident', label: 'Residente' },
  { value: 'owner',   label: 'Propietario' },
  { value: 'tenant',  label: 'Arrendatario' },
  { value: 'buyer',   label: 'Comprador' },
  { value: 'other',   label: 'Otro' },
];

const DOC_TYPES = [
  { value: 'cc',       label: 'Cédula de ciudadanía' },
  { value: 'ce',       label: 'Cédula de extranjería' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'nit',      label: 'NIT' },
  { value: 'other',    label: 'Otro' },
];

export function ResidentForm({ organizationId, assets, chatSessions, resident, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!resident;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit) {
        await updateResidentAction(resident!.id, formData);
      } else {
        await createResidentAction(formData);
      }
      onSuccess?.();
    });
  };

  const field = 'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373]';
  const label = 'block text-xs font-medium text-[var(--muted)] mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="organization_id" value={organizationId} />

      {/* Nombre completo */}
      <div>
        <label className={label}>Nombre completo *</label>
        <input name="full_name" required defaultValue={resident?.full_name} className={field} placeholder="Ej. Carlos Gálvez" />
      </div>

      {/* Email + Teléfono */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Correo electrónico</label>
          <input name="email" type="email" defaultValue={resident?.email ?? ''} className={field} placeholder="correo@email.com" />
        </div>
        <div>
          <label className={label}>Teléfono</label>
          <input name="phone" type="tel" defaultValue={resident?.phone ?? ''} className={field} placeholder="+57 300 000 0000" />
        </div>
      </div>

      {/* Documento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Tipo de documento</label>
          <select name="document_type" defaultValue={resident?.document_type ?? ''} className={field}>
            <option value="">Seleccionar...</option>
            {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Número de documento</label>
          <input name="document_number" defaultValue={resident?.document_number ?? ''} className={field} placeholder="123456789" />
        </div>
      </div>

      {/* Unidad + Tipo de relación */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Unidad / Activo</label>
          <select name="asset_id" defaultValue={resident?.asset_id ?? ''} className={field}>
            <option value="">Sin unidad asignada</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}{a.code ? ` (${a.code})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Tipo de relación</label>
          <select name="relation_type" defaultValue={resident?.relation_type ?? 'resident'} className={field}>
            {RELATION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Ubicación metadata */}
      <div>
        <p className="text-xs font-medium text-[var(--muted)] mb-2">Ubicación dentro del inmueble</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={label}>Torre</label>
            <input name="tower" defaultValue={resident?.metadata?.tower ?? ''} className={field} placeholder="A, B, Norte..." />
          </div>
          <div>
            <label className={label}>Piso</label>
            <input name="floor" defaultValue={resident?.metadata?.floor?.toString() ?? ''} className={field} placeholder="3" />
          </div>
          <div>
            <label className={label}>Apto / Unidad</label>
            <input name="unit" defaultValue={resident?.metadata?.unit ?? ''} className={field} placeholder="301" />
          </div>
        </div>
      </div>

      {/* Fecha de ingreso */}
      <div>
        <label className={label}>Fecha de ingreso</label>
        <input name="move_in_date" type="date" defaultValue={resident?.move_in_date ?? ''} className={field} />
      </div>

      {/* Sesión Telegram */}
      {chatSessions.length > 0 && (
        <div>
          <label className={label}>Sesión Telegram vinculada</label>
          <select name="telegram_session_id" defaultValue={resident?.telegram_session_id ?? ''} className={field}>
            <option value="">Sin vincular</option>
            {chatSessions.map(cs => (
              <option key={cs.id} value={cs.id}>
                {cs.display_name ?? cs.telegram_username ?? cs.id}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted)] mt-1">Vincula para que el residente reciba notificaciones por Telegram.</p>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className={label}>Notas internas</label>
        <textarea name="notes" rows={3} defaultValue={resident?.notes ?? ''} className={`${field} resize-none`} placeholder="Observaciones adicionales..." />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ backgroundColor: '#d4a373' }}
      >
        {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear residente'}
      </button>
    </form>
  );
}
