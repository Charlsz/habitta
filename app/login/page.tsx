import { LoginForm } from "@/modules/auth/presentation/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="habitta-card w-full max-w-md p-8 flex flex-col items-center">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="habitta-title text-3xl">Habitta</h1>
          </Link>
          <p className="habitta-muted mt-2 text-sm">Organiza e interopera los activos de tu empresa.</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
