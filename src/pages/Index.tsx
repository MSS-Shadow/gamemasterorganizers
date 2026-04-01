import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Megaphone, Zap, MessageCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ players: 0, teams: 0, tournaments: 0, scrims: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Cargando datos seguros...");

        const [profileRes, clanRes, annRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("clans").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*").limit(5),
        ]);

        setStats({
          players: (profileRes as any).count ?? 0,
          teams: (clanRes as any).count ?? 0,
          tournaments: 0,
          scrims: 0,
        });

        setAnnouncements((annRes.data ?? []));

        console.log("✅ Datos cargados:", {
          players: (profileRes as any).count,
          teams: (clanRes as any).count,
          announcements: (annRes.data ?? []).length
        });

      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center py-16 bg-zinc-900 rounded-3xl border border-zinc-800">
        <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-4">Game Master Organizers</h1>
        <p className="text-xl text-zinc-400">Torneos y comunidad de BloodStrike LATAM</p>
        {user && <p className="mt-4 text-green-400">✅ Logueado como: {user.email}</p>}
        {isAdmin && <p className="text-yellow-400">👑 Eres Administrador</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Jugadores Registrados", value: stats.players },
          { label: "Clanes Activos", value: stats.teams },
          { label: "Torneos", value: stats.tournaments },
          { label: "Scrims", value: stats.scrims },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-6xl font-bold text-yellow-400">{stat.value}</p>
            <p className="text-zinc-400 mt-3">{stat.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-yellow-400" /> Últimas Noticias
        </h2>
        {announcements.length > 0 ? (
          announcements.map((a: any) => (
            <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
              <p className="text-sm text-zinc-500">{new Date(a.created_at).toLocaleDateString("es")}</p>
              <h3 className="font-semibold text-white">{a.title}</h3>
              <p className="text-zinc-400 mt-2">{a.description}</p>
            </div>
          ))
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <p className="text-zinc-500">No hay anuncios por el momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
