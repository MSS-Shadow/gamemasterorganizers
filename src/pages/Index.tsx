import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function HomePage() {
  const [stats, setStats] = useState({
    players: 0,
    teams: 0,
    tournaments: 0,
    scrims: 0
  });
  const [errorLog, setErrorLog] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const newErrors: string[] = [];

      try {
        console.log("🔍 Iniciando diagnóstico de Supabase...");

        // 1. Profiles
        const profileRes = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        console.log("Profiles response:", profileRes);

        if (profileRes.error) newErrors.push(`Profiles error: ${profileRes.error.message}`);

        // 2. Clans
        const clanRes = await supabase
          .from("clans")
          .select("*", { count: "exact", head: true });

        console.log("Clans response:", clanRes);

        if (clanRes.error) newErrors.push(`Clans error: ${clanRes.error.message}`);

        // 3. Announcements (para ver si al menos una tabla funciona)
        const annRes = await supabase
          .from("announcements")
          .select("*")
          .limit(3);

        console.log("Announcements response:", annRes);

        setStats({
          players: profileRes.count ?? 0,
          teams: clanRes.count ?? 0,
          tournaments: 0,
          scrims: 0,
        });

        setErrorLog(newErrors);

        console.log("📊 Estadísticas finales:", {
          players: profileRes.count,
          teams: clanRes.count,
          announcements: annRes.data?.length || 0
        });

      } catch (err: any) {
        console.error("Error general:", err);
        newErrors.push(`General error: ${err.message}`);
        setErrorLog(newErrors);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Game Master Organizers</h1>
        <p className="text-zinc-400">Diagnóstico de conexión con Supabase</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
          <p className="text-6xl font-bold text-yellow-400">{stats.players}</p>
          <p className="text-zinc-400 mt-3">Jugadores Registrados</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
          <p className="text-6xl font-bold text-yellow-400">{stats.teams}</p>
          <p className="text-zinc-400 mt-3">Clanes Activos</p>
        </div>
      </div>

      {errorLog.length > 0 && (
        <div className="bg-red-950 border border-red-800 rounded-2xl p-6">
          <h3 className="text-red-400 font-semibold mb-3">Errores detectados:</h3>
          <ul className="text-red-300 text-sm space-y-1">
            {errorLog.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-zinc-500 text-sm">
        Revisa la consola del navegador (F12) para más detalles.
      </div>
    </div>
  );
}
