"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { organizationSchema, type OrganizationInsert } from "../domain/organization.schema";
import { createOrganizationAction } from "../application/organization.actions";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full mt-1 border px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#d4a373] bg-white";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const errorClass = "text-red-500 text-xs mt-1";

export function OrganizationForm() {
  const router  = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrganizationInsert>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name:             "",
      type:             "residential",
      other_type_label: "",
      address:          "",
      city:             "",
      phone:            "",
      email:            "",
      status:           "active",
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = (data: OrganizationInsert) => {
    setErrorMsg(null);
    // Si no es 'other', limpiar el label personalizado
    if (data.type !== "other") data.other_type_label = null;
    // Convertir strings vacios a null para campos opcionales
    if (!data.email)   data.email   = null;
    if (!data.address) data.address = null;
    if (!data.city)    data.city    = null;
    if (!data.phone)   data.phone   = null;

    startTransition(async () => {
      const response = await createOrganizationAction(data);
      if (response?.error) {
        setErrorMsg(response.error);
      } else {
        router.push("/organizations");
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm"
    >
      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre de la Organización <span className="text-red-500">*</span></label>
        <input
          {...form.register("name")}
          placeholder="Ej: Edificio Houston, Constructora ABC"
          className={inputClass}
        />
        {form.formState.errors.name && (
          <p className={errorClass}>{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Tipo */}
      <div>
        <label className={labelClass}>Tipo <span className="text-red-500">*</span></label>
        <select {...form.register("type")} className={inputClass}>
          <option value="residential">Residencial / Condominio</option>
          <option value="construction">Constructora</option>
          <option value="real_estate">Inmobiliaria</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {/* Campo libre si eligio Otro */}
      {selectedType === "other" && (
        <div className="animate-in fade-in duration-200">
          <label className={labelClass}>¿Qué tipo de organización es? <span className="text-red-500">*</span></label>
          <input
            {...form.register("other_type_label")}
            placeholder="Ej: Vivienda propia, Operación multisede, Hospital..."
            className={inputClass}
          />
          {form.formState.errors.other_type_label && (
            <p className={errorClass}>{form.formState.errors.other_type_label.message}</p>
          )}
        </div>
      )}

      {/* Separador visual */}
      <div className="border-t border-[var(--border)] pt-1">
        <p className="text-xs text-[var(--muted)] mb-3">Información de contacto (opcional)</p>

        {/* Ciudad y Dirección en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ciudad</label>
            <input
              {...form.register("city")}
              placeholder="Ej: Cali, Bogotá"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dirección</label>
            <input
              {...form.register("address")}
              placeholder="Ej: Cra 5 #20-30"
              className={inputClass}
            />
          </div>
        </div>

        {/* Teléfono y Email en fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              {...form.register("phone")}
              type="tel"
              placeholder="Ej: +57 300 123 4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Correo electrónico</label>
            <input
              {...form.register("email")}
              type="email"
              placeholder="Ej: contacto@edificiohouston.com"
              className={inputClass}
            />
            {form.formState.errors.email && (
              <p className={errorClass}>{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className={labelClass}>Estado</label>
        <select {...form.register("status")} className={inputClass}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#d4a373] hover:bg-[#c8935f] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
      >
        {isPending ? "Creando organización..." : "Crear Organización"}
      </button>
    </form>
  );
}
