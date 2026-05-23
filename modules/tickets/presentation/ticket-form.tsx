"use client";

import { useTransition, useState } from "react";
import { createTicketAction } from "../application/ticket.actions";
import { useRouter } from "next/navigation";
import { CategoryBadge } from "@/modules/ticket-categories/presentation/category-badge";
import type { TicketCategory } from "@/modules/ticket-categories/domain/category.schema";

interface FormProps {
  organizations: { id: string; name: string }[];
  assets:        { id: string; name: string; organization_id: string }[];
  categoriesByOrg: Record<string, TicketCategory[]>;
}

const inputClass = "w-full mt-1 border border-[var(--border)] px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#d4a373] bg-white";
const labelClass = "text-sm font-medium text-[var(--foreground)]";

export function TicketForm({ organizations, assets, categoriesByOrg }: FormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?.id || "");

  const filteredAssets     = assets.filter((a) => a.organization_id === selectedOrg);
  const filteredCategories = categoriesByOrg[selectedOrg] ?? [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMsg(null);
    startTransition(async () => {
      const response = await createTicketAction(formData);
      if (response?.error) setErrorMsg(response.error);
      else if (response?.success) router.push("/tickets");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 habitta-card p-6">

      {/* Organización y Activo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Organización</label>
          <select
            name="organization_id"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className={inputClass}
            required
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Activo <span className="text-xs habitta-muted">(opcional)</span></label>
          <select name="asset_id" className={inputClass}>
            <option value="">General — sin activo específico</option>
            {filteredAssets.map((ast) => (
              <option key={ast.id} value={ast.id}>{ast.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label className={labelClass}>Categoría</label>
        {filteredCategories.length === 0 ? (
          <p className="text-xs habitta-muted mt-1 italic">No hay categorías configuradas para esta organización.</p>
        ) : (
          <select name="category_id" className={inputClass} required>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Título */}
      <div>
        <label className={labelClass}>Título de la incidencia</label>
        <input
          name="title"
          placeholder="Ej: Fuga de agua en el piso 2"
          required
          minLength={3}
          className={inputClass}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción detallada</label>
        <textarea
          name="description"
          rows={4}
          required
          placeholder="Describe el problema o requerimiento..."
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Prioridad + Fecha límite + Adjunto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Prioridad</label>
          <select name="priority" className={inputClass}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Fecha límite
            <span className="ml-1 text-xs habitta-muted">(opcional)</span>
          </label>
          <input
            type="date"
            name="due_date"
            min={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Evidencia</label>
          <input
            type="file"
            name="attachment"
            accept="image/*,.pdf"
            className="w-full mt-1 text-sm border border-[var(--border)] px-3 py-1.5 rounded-md file:bg-gray-100 file:border-0 file:py-1 file:px-3 file:mr-2 file:rounded-md cursor-pointer"
          />
        </div>
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#d4a373] hover:bg-[#c8935f] text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
      >
        {isPending ? "Generando Ticket..." : "Crear Ticket"}
      </button>
    </form>
  );
}
