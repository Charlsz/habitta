"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { assetSchema, type AssetInsert } from "../domain/asset.schema";
import { createAssetAction } from "../application/asset.actions";

export function AssetForm({ organizationId }: { organizationId: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssetInsert>({
    resolver: zodResolver(assetSchema),
    defaultValues: { 
      organization_id: organizationId,
      name: "", 
      location: "",
      status: "active" 
    },
  });

  const onSubmit = (data: AssetInsert) => {
    setErrorMsg(null);
    startTransition(async () => {
      const response = await createAssetAction(data);
      if (response?.error) {
        setErrorMsg(response.error);
      } else {
        form.reset(); // Limpia el formulario tras éxito
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-semibold text-lg">Registrar Activo</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nombre (Ej: Tractor Cat, Depto 402)</label>
          <input 
            {...form.register("name")} 
            className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ubicación</label>
          <input 
            {...form.register("location")} 
            className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          />
        </div>
      </div>
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-gray-900 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm"
      >
        {isPending ? "Guardando..." : "Guardar Activo"}
      </button>
    </form>
  );
}