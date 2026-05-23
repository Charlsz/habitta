"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "../application/event.actions";

interface FormProps {
  organizations: { id: string, name: string }[];
  assets: { id: string, name: string, organization_id: string }[];
}

export function EventForm({ organizations, assets }: FormProps) {
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
      const response = await createEventAction(formData);
      if (response?.error) {
        setErrorMsg(response.error);
      } else if (response?.success) {
        router.push("/scheduling");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg border shadow-sm">
      
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
          <label className="text-sm font-medium">Activo Vinculado (Opcional)</label>
          <select name="asset_id" className="w-full mt-1 border px-3 py-2 rounded-md outline-none bg-gray-50">
            <option value="">Ninguno (Evento General)</option>
            {filteredAssets.map(ast => <option key={ast.id} value={ast.id}>{ast.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Título de la actividad / reserva</label>
        <input 
          name="title" 
          placeholder="Ej: Mantenimiento de elevador, Reserva quincho..."
          required
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Inicio</label>
          <input 
            type="datetime-local" 
            name="start_time" 
            required
            className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div>
          <label className="text-sm font-medium">Fin Esperado</label>
          <input 
            type="datetime-local" 
            name="end_time" 
            required
            className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descripción (Opcional)</label>
        <textarea 
          name="description" 
          rows={3}
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      {errorMsg && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{errorMsg}</p>}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Agendando..." : "Crear Evento en Agenda"}
      </button>
    </form>
  );
}
