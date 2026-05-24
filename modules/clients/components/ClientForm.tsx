'use client';

import { useActionState, useEffect } from 'react';
import { createClientAction, updateClientAction } from '../application/client.actions';
import type { Client, ClientRelationType, DocumentType } from '../domain/client.types';

interface Asset       { id: string; name: string; code: string | null; }
interface ChatSession { id: string; display_name: string | null; telegram_username: string | null; }

interface Props {
  organizationId: string;
  assets:         Asset[];
  chatSessions:   ChatSession[];
  client?:        Client;
  onSuccess?:     () => void;
}

const RELATION_OPTIONS: { value: ClientRelationType; label: string }[] = [
  { value: 'resident', label: 'Residente' },
  { value: 'owner',   label: 'Propietario' },
  { value: 'tenant',  label: 'Arrendatario' },
  { value: 'buyer',   label: 'Comprador' },
  { value: 'other',   label: 'Otro' },
];

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'cc',       label: 'Cédula de ciudadanía' },
  { value: 'ce',       label: 'Cédula de extranjería' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'nit',      label: 'NIT' },
  { value: 'other',    label: 'Otro' },
];

const INITIAL_STATE = { error: undefined as string | undefined };

export function ClientForm({ organizationId, assets, chatSessions, client, onSuccess }: Props) {
  const isEdit = !!client;

  const boundAction = isEdit
    ? updateClientAction.bind(null, client!.id)
    : createClientAction;

  const [state, formAction, isPending] = useActionState(
    boundAction as any,
    INITIAL_STATE
  );

  useEffect(() => {
    if (state && !state.error && Object.keys(state).length === 0) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const field = 'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a373] transition-shadow';
  const label = 'block text-xs font-medium text-[var(--muted)] mb-1';
  const section = 'space-y-3';

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="organization_id" value={organizationId} />

      {state?.error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Nombre */}
      <div className={section}>
        <div>
          <label className={label}>Nombre completo *</label>
          <input name="full_name" required defaultValue={client?.full_name}
            className={field} placeholder="Ej. Carlos Gálvez" />
        </div>
      </div>

      {/* Contacto */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Contacto</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Correo electrónico</label>
            <input name="email" type="email" defaultValue={client?.email ?? ''}
              className={field} placeholder="correo@email.com" />
          </div>
          <div>
            <label className={label}>Teléfono</label>
            <input name="phone" type="tel" defaultValue={client?.phone ?? ''}
              className={field} placeholder="+57 300 000 0000" />
          </div>
        </div>
      </div>

      {/* Documento */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Identificación</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Tipo</label>
            <select name="document_type" defaultValue={client?.document_type ?? ''} className={field}>
              <option value="">Seleccionar...</option>
              {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Número</label>
            <input name="document_number" defaultValue={client?.document_number ?? ''}
              className={field} placeholder="123456789" />
          </div>
        </div>
      </div>

      {/* Unidad */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Unidad asignada</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Unidad / Activo</label>
            <select name="asset_id" defaultValue={client?.asset_id ?? ''} className={field}>
              <option value="">Sin unidad asignada</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.code ? ` (${a.code})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Tipo de relación</label>
            <select name="relation_type" defaultValue={client?.relation_type ?? 'resident'} className={field}>
              {RELATION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className={label}>Torre</label>
            <input name="tower" defaultValue={client?.metadata?.tower ?? ''}
              className={field} placeholder="A, Norte..." />
          </div>
          <div>
            <label className={label}>Piso</label>
            <input name="floor" defaultValue={String(client?.metadata?.floor ?? '')}
              className={field} placeholder="3" />
          </div>
          <div>
            <label className={label}>Apto / Unidad</label>
            <input name="unit" defaultValue={client?.metadata?.unit ?? ''}
              className={field} placeholder="301" />
          </div>
        </div>
      </div>

      {/* Ocupación */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Ocupación</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Fecha de ingreso</label>
            <input name="move_in_date" type="date" defaultValue={client?.move_in_date ?? ''} className={field} />
          </div>
          <div>
            <label className={label}>Fecha de salida</label>
            <input name="move_out_date" type="date" defaultValue={client?.move_out_date ?? ''} className={field} />
          </div>
        </div>
      </div>

      {/* Telegram */}
      {chatSessions.length > 0 && (
        <div>
          <label className={label}>Sesión Telegram vinculada</label>
          <select name="telegram_session_id" defaultValue={client?.telegram_session_id ?? ''} className={field}>
            <option value="">Sin vincular</option>
            {chatSessions.map(cs => (
              <option key={cs.id} value={cs.id}>
                {cs.display_name ?? cs.telegram_username ?? `Chat ${cs.id.slice(0,8)}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted)] mt-1">
            Vincula para enviarle notificaciones y broadcasts por Telegram.
          </p>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className={label}>Notas internas</label>
        <textarea name="notes" rows={3} defaultValue={client?.notes ?? ''}
          className={`${field} resize-none`}
          placeholder="Observaciones adicionales..." />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: '#d4a373' }}
      >
        {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
      </button>
    </form>
  );
}
