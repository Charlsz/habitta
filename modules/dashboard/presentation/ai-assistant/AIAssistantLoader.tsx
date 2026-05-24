import { getOrganizationAIContext } from "@/modules/dashboard/application/ai-assistant.actions";
import { AIAssistantButton } from "./AIAssistantButton";

export async function AIAssistantLoader() {
  const context = await getOrganizationAIContext().catch(() => null);
  return <AIAssistantButton context={context} />;
}
