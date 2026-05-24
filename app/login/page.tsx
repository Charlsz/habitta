import { LoginForm } from "@/modules/auth/presentation/login-form";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="habitta-card w-full max-w-md p-8 flex flex-col items-center">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <Image
              src="/habitta_icon.png"
              alt="Habitta"
              width={56}
              height={56}
              className="rounded-2xl shadow-sm transition-transform group-hover:scale-105"
              priority
            />
            <h1 className="habitta-title text-2xl">Habitta</h1>
          </Link>
          <p className="habitta-muted mt-2 text-sm">Organiza e interopera los activos de tu empresa.</p>
        </div>

        <LoginForm />

        <p className="habitta-muted mt-8 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="habitta-link">
            Créala aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
