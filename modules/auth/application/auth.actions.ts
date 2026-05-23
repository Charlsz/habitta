"use server";

import { createClient } from "@/modules/core/infrastructure/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { loginSchema, LoginSchemaType } from "../domain/auth.schema";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

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

export async function registerAction(data: RegisterSchemaType) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos de formulario inválidos" };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return { error: "Falta configurar Supabase para crear usuarios." };
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    if (message.includes("already") || message.includes("registered") || message.includes("duplicate")) {
      const supabase = await createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!signInError && signInData.user) {
        await admin
          .from("profiles")
          .upsert({
            id: signInData.user.id,
            full_name: parsed.data.fullName,
          });

        revalidatePath("/", "layout");
        redirect("/dashboard");
      }

      return { error: "Este correo ya está registrado. Inicia sesión o usa otro correo." };
    }
    return { error: createError.message };
  }

  if (!created.user) {
    return { error: "No se pudo crear el usuario en Supabase." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({
      id: created.user.id,
      full_name: parsed.data.fullName,
    });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: `No se pudo crear el perfil: ${profileError.message}` };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: "Tu cuenta fue creada, pero no se pudo iniciar sesión automáticamente. Intenta ingresar." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
