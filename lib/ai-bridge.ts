// AI Bridge — allows the main AI assistant to send instructions to other page-level chats
// Uses localStorage so it works across page navigations without extra dependencies

export const AI_BRIDGE_KEY = "habitta_ai_bridge";

export interface AIBridgePayload {
  instruction: string;
  orgId: string;
  target: "documents";
  timestamp: number;
}

export function setAIBridgeInstruction(payload: Omit<AIBridgePayload, "timestamp">) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_BRIDGE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() }));
}

export function popAIBridgeInstruction(target: AIBridgePayload["target"]): AIBridgePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AI_BRIDGE_KEY);
    if (!raw) return null;
    const payload: AIBridgePayload = JSON.parse(raw);
    // Only consume if it's for this target and fresh (< 30 seconds old)
    if (payload.target !== target) return null;
    if (Date.now() - payload.timestamp > 30_000) {
      localStorage.removeItem(AI_BRIDGE_KEY);
      return null;
    }
    localStorage.removeItem(AI_BRIDGE_KEY);
    return payload;
  } catch {
    return null;
  }
}
