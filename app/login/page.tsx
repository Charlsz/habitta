import { LoginForm } from "@/modules/auth/presentation/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Habitta</h1>
          <p className="text-gray-500 mt-2 text-sm">Organiza e interopera los activos de tu empresa.</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}