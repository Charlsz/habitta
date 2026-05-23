"use server";

import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, LoginSchemaType } from "../domain/auth.schema";

export async function loginAction(data: LoginSchemaType) {
  // 1. Validar inputs base server side
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos de formulario inválidos" };
  }

  // 2. Autenticar con Supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // 3. Revalidar y redireccionar (Fuera del clousure de manejo de errores, limpia el layout)
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
