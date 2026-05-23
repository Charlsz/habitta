"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { loginSchema, type LoginSchemaType } from "../domain/auth.schema";
import { loginAction } from "../application/auth.actions";

export function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginSchemaType) => {
    setErrorMsg(null);
    startTransition(async () => {
      const response = await loginAction(data);
      if (response?.error) {
        setErrorMsg(response.error);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          {...form.register("email")}
          type="email"
          placeholder="tu@email.com"
          className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Contraseña</label>
        <input
          {...form.register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50 transition-colors"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
