"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerAction } from "@/modules/auth/application/auth.actions";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const response = await registerAction(data);
    if (response?.error) {
      setError(response.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 font-sans">
      <div className="habitta-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <h1 className="habitta-title text-3xl">Habitta</h1>
          </Link>
          <p className="habitta-muted mt-2 font-medium">Crea tu cuenta gratis</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Nombre completo</label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Juan Pérez"
              disabled={isSubmitting}
              className="habitta-input w-full px-4 py-3"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Correo Electrónico</label>
            <input
              {...register("email")}
              type="email"
              placeholder="juan@ejemplo.com"
              disabled={isSubmitting}
              className="habitta-input w-full px-4 py-3"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="habitta-input w-full px-4 py-3"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[var(--foreground)]">Confirmar contraseña</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="habitta-input w-full px-4 py-3"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="habitta-primary w-full py-3.5 px-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
          <p className="habitta-muted text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="habitta-link">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
