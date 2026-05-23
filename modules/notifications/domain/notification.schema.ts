export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id:              string;
  organization_id: string | null;
  user_id:         string;
  title:           string;
  message:         string | null;
  type:            NotificationType;
  read:            boolean;
  created_at:      string;
}

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  info:    "ℹ️",
  warning: "⚠️",
  success: "✅",
  error:   "❌",
};

export const NOTIFICATION_COLOR: Record<NotificationType, string> = {
  info:    "text-blue-600  bg-blue-50",
  warning: "text-yellow-600 bg-yellow-50",
  success: "text-green-600  bg-green-50",
  error:   "text-red-600    bg-red-50",
};
