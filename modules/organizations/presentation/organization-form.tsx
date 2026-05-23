"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { organizationSchema, type OrganizationInsert } from "../domain/organization.schema";
import { createOrganizationAction } from "../application/organization.actions";
import { useRouter } from "next/navigation";

export function OrganizationForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrganizationInsert>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: "", type: "residential" },
  });

  const onSubmit = (data: OrganizationInsert) => {
    setErrorMsg(null);
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg border">
      <div>
        <label className="text-sm font-medium">Nombre de la Organización</label>
        <input 
          {...form.register("name")} 
          placeholder="Ej: Constructora ABC"
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
        />
        {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Tipo</label>
        <select 
          {...form.register("type")} 
          className="w-full mt-1 border px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="residential">Residencial / Condominio</option>
          <option value="construction">Constructora</option>
          <option value="real_estate">Inmobiliaria</option>
          <option value="other">Otro</option>
        </select>
      </div>

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear Organización"}
      </button>
    </form>
  );
}
