"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/modules/auth/application/auth.guard";
import { markAllNotificationsRead } from "../infrastructure/notification.repository";

export async function markNotificationsReadAction() {
  try {
    const user = await requireAuth();
    await markAllNotificationsRead(user.id);
    revalidatePath("/", "layout"); // refresca el badge en toda la app
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
