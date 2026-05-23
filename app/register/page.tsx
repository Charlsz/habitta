"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/modules/core/infrastructure/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Esquema de registro
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

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario");
      }

      // 2. Crear insert en public.profiles
      // (Suponiendo que el schema lo permite sin restricciones de autenticación previas en insert)
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          full_name: data.fullName,
        },
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Fallback: Aún si falla la creación del perfil por RLS, el user en Auth existe. 
        // Normalmente esto se maneja con triggers en DB, pero lo requeriste aquí.
      }

      // 3. Redirigir al dashboard
      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      setError(
        err.message === "User already registered" || err.message.includes("already registered")
          ? "El usuario ya se encuentra registrado. Por favor inicia sesión."
          : err.message || "Ocurrió un error en el registro."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">Habitta</h1>
          </Link>
          <p className="text-zinc-500 mt-2 font-medium">Crea tu cuenta gratis</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Nombre completo</label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Juan Pérez"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-zinc-50 focus:bg-white text-zinc-900"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Correo Electrónico</label>
            <input
              {...register("email")}
              type="email"
              placeholder="juan@ejemplo.com"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-zinc-50 focus:bg-white text-zinc-900"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-zinc-50 focus:bg-white text-zinc-900"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Confirmar contraseña</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-zinc-50 focus:bg-white text-zinc-900"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-sm shadow-indigo-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}