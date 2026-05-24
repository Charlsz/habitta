import { headers } from "next/headers";
import { getOrganizationAIContext } from "@/modules/dashboard/application/ai-assistant.actions";
import { getOrganizations } from "@/modules/organizations/infrastructure/organization.repository";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { AIAssistantButton } from "./AIAssistantButton";

export async function AIAssistantLoader() {
  const user = await requireAuth().catch(() => null);
  if (!user) return null;

  // Leer la URL activa para extraer ?org= y saber qué org tiene seleccionada el admin
  const headersList = await headers();
  const referer = headersList.get("referer") ?? "";
  const nextUrl = headersList.get("x-url") ?? referer;

  let activeOrgId: string | undefined;
  try {
    const url = new URL(nextUrl);
    activeOrgId = url.searchParams.get("org") ?? undefined;
  } catch {
    // no-op, se usará la primera org del usuario como fallback
  }

  // Si no hay ?org= en la URL, tomar la primera org del usuario
  if (!activeOrgId) {
    const orgs = await getOrganizations(user.id).catch(() => []);
    activeOrgId = orgs[0]?.id;
  }

  const context = await getOrganizationAIContext(activeOrgId).catch(() => null);

  return <AIAssistantButton initialContext={context} />;
}
