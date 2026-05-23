export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholders base para la hackathon */}
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-gray-500">Tickets Activos</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-gray-500">Activos en Mantenimiento</h3>
          <p className="text-3xl font-bold mt-2">4</p>
        </div>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-gray-500">Eventos de Agenda (Hoy)</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
      </div>
    </div>
  );
}