"use client";

import { useTransition, useState } from "react";
import { createTicketAction } from "../application/ticket.actions";
import { useRouter } from "next/navigation";

interface FormProps {
  organizations: { id: string, name: string }[];
  assets: { id: string, name: string, organization_id: string }[];
}

export function TicketForm({ organizations, assets }: FormProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?.id || "");

  const filteredAssets = assets.filter(a => a.organization_id === selectedOrg);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setErrorMsg(null);
    startTransition(async () => {
      const response = await createTicketAction(formData);
      if (response?.error) {
        setErrorMsg(response.error);
      } else if (response?.success) {
        router.push("/tickets");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg border shadow-sm">
      
      {/* 1. Selección de Entidades */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Organización</label>
          <select 
            name="organization_id" 
            value={selectedOrg}
            onChange={e => setSelectedOrg(e.target.value)}
            className="w-full mt-1 border px-3 py-2 rounded-md outline-none bg-gray-50"
            required
          >
            {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Activo (opcional)</label>
          <select name="asset_id" className="w-full mt-1 border px-3 py-2 rounded-md outline-none bg-gray-50">
            <option value="">General (Sin activo específico)</option>
            {filteredAssets.map(ast => <option key={ast.id} value={ast.id}>{ast.name}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Detalles del Ticket */}
      <div>
        <label className="text-sm font-medium">Título de la incidencia</label>
        <input 
          name="title" 
          placeholder="Ej: Fuga de agua en el piso 2"
          required
          minLength={3}
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div>
        <label className="text-sm font-medium">Descripción detallada</label>
        <textarea 
          name="description" 
          rows={4}
          required
          placeholder="Describe el problema o requerimiento..."
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Prioridad</label>
          <select name="priority" className="w-full mt-1 border px-3 py-2 rounded-md outline-none">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Evidencia (Fotografía/PDF)</label>
          <input 
            type="file" 
            name="attachment" 
            accept="image/*,.pdf"
            className="w-full mt-1 text-sm border px-3 py-1.5 rounded-md file:bg-gray-100 file:border-0 file:py-1 file:px-3 file:mr-2 file:rounded-md cursor-pointer" 
          />
        </div>
      </div>

      {errorMsg && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorMsg}</p>}

      <hr className="my-4" />
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Generando Ticket..." : "Crear Ticket"}
      </button>
    </form>
  );
}
