import { OrganizationForm } from "@/modules/organizations/presentation/organization-form";
import Link from "next/link";

export default function NewOrganizationPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <div>
        <Link href="/organizations" className="text-blue-600 text-sm mb-4 inline-block hover:underline">
          ← Volver a listado
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Crear Organización</h1>
        <p className="text-gray-500 mt-2">Agrega un nuevo espacio de trabajo para administrar activos.</p>
      </div>
      <OrganizationForm />
    </div>
  );
}