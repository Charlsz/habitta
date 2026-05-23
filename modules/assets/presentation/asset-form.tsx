"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { assetSchema, type AssetInsert, ASSET_TYPE_LABELS } from "../domain/asset.schema";
import { createAssetAction } from "../application/asset.actions";

const inputClass =
  "w-full mt-1 border px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#d4a373] bg-white";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const errorClass = "text-red-500 text-xs mt-1";

export function AssetForm({ organizationId }: { organizationId: string }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssetInsert>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      organization_id: organizationId,
      name:        "",
      asset_type:  "other",
      code:        "",
      location:    "",
      description: "",
      status:      "active",
    },
  });

  const onSubmit = (data: AssetInsert) => {
    setErrorMsg(null);
    // Auto-generar code si no se ingresó uno
    if (!data.code || data.code.trim() === "") {
      data.code = `ACT-${Date.now()}`;
    }
    // Limpiar opcionales vacíos
    if (!data.location)    data.location    = null;
    if (!data.description) data.description = null;

    startTransition(async () => {
      const response = await createAssetAction(data);
      if (response?.error) {
        setErrorMsg(response.error);
      } else {
        form.reset({ organization_id: organizationId, asset_type: "other", status: "active" });
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 bg-[var(--background)] p-5 rounded-xl border border-[var(--border)] shadow-sm"
    >
      <h3 className="font-semibold text-lg text-[var(--foreground)]">Registrar Activo</h3>

      {/* Nombre y Tipo en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
          <input
            {...form.register("name")}
            placeholder="Ej: Apartamento 402, Zona BBQ"
            className={inputClass}
          />
          {form.formState.errors.name && (
            <p className={errorClass}>{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Tipo de activo <span className="text-red-500">*</span></label>
          <select {...form.register("asset_type")} className={inputClass}>
            {(Object.entries(ASSET_TYPE_LABELS) as [string, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Código y Ubicación en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Código
            <span className="ml-1 text-xs text-[var(--muted)]">(se genera automáticamente si se deja vacío)</span>
          </label>
          <input
            {...form.register("code")}
            placeholder="Ej: APT-402"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ubicación</label>
          <input
            {...form.register("location")}
            placeholder="Ej: Torre A, Piso 4"
            className={inputClass}
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          {...form.register("description")}
          rows={2}
          placeholder="Información adicional sobre el activo..."
          className={inputClass + " resize-none"}
        />
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#d4a373] hover:bg-[#c8935f] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 text-sm"
      >
        {isPending ? "Guardando..." : "Guardar Activo"}
      </button>
    </form>
  );
}
