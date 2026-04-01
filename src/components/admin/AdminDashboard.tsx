import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    players: 0,
    tournaments: 0,
    scrims: 0,
    clans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Consultas seguras sin .catch() directo
        const profilesQuery = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const clansQuery = await supabase
          .from("clans")
          .select("*", { count: "exact", head: true });

        setStats({
          players: profilesQuery.count || 0,
          tournaments: 0,
          scrims: 0,
          clans: clansQuery.count || 0,
        });
      } catch (err: any) {
        console.error("Error cargando stats:", err);
        toast.error("Error al cargar estadísticas del dashboard");
        
        // Valores por defecto si falla
        setStats({
          players: 0,
          tournaments: 0,
          scrims: 0,
          clans: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando panel de administrador...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administrador</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jugadores Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-yellow-400">{stats.players}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Torneos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.tournaments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scrims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.scrims}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clanes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.clans}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
        <p className="text-zinc-400 text-lg">
          Bienvenido al panel de administrador.<br />
          Las demás secciones se irán activando progresivamente.
        </p>
      </div>
    </div>
  );
}
