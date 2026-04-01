import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administrador</h1>
      <p className="text-zinc-400">Bienvenido al panel de control</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jugadores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-yellow-400">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Torneos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scrims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">—</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clanes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
        <p className="text-zinc-400 text-lg">
          El panel de administrador está en desarrollo.<br />
          Algunas secciones se irán activando progresivamente.
        </p>
      </div>
    </div>
  );
}
