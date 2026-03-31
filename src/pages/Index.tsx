import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Megaphone,
  Crown,
  Zap,
  MessageCircle,
  Star,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 }
  }),
};

export default function HomePage() {
  const [stats, setStats] = useState({ 
    tournaments: 0, 
    scrims: 0, 
    upcoming: 0, 
    players: 0, 
    teams: 0 
  });
  
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Cargando datos...");

        const [profileRes, clanRes, tourRes, scrimRes, annRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).catch(() => ({ count: 0 })),
          supabase.from("clans").select("*", { count: "exact", head: true }).catch(() => ({ count: 0 })),
          
          // Consulta simple para tournaments (sin order por 'date' si no existe)
          supabase.from("tournaments").select("*").limit(10).catch(() => ({ data: [] })),
          
          // Consulta simple para scrims
          supabase.from("scrims").select("*").limit(6).catch(() => ({ data: [] })),
          
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(4).catch(() => ({ data: [] })),
        ]);

        const tours = tourRes.data ?? [];
        const openTours = tours.filter((t: any) => 
          t.status === "Open" || t.status?.toLowerCase() === "open"
        );

        setUpcomingTournaments(openTours.slice(0, 4));
        setAnnouncements((annRes.data ?? []));

        setStats({
          tournaments: tours.filter((t: any) => 
            t.status === "Finished" || t.status?.toLowerCase() === "finished"
          ).length,
          scrims: (scrimRes.data ?? []).length,
          upcoming: openTours.length,
          players: (profileRes as any).count ?? 0,
          teams: (clanRes as any).count ?? 0,
        });

        console.log("📊 Estadísticas finales:", {
          players: (profileRes as any).count,
          teams: (clanRes as any).count,
          tournaments: tours.length,
          scrims: (scrimRes.data ?? []).length
        });

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-16">
      {/* HERO SECTION - igual que antes */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#eab30810_0%,transparent_70%)]" />
       
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" /> Comunidad Competitiva BloodStrike LATAM
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none mb-6">
              Donde nace la <span className="text-yellow-400">leyenda</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Torneos profesionales, scrims de alto nivel y rankings actualizados.<br />
              La plataforma más seria para jugadores competitivos de BloodStrike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tournaments"
                className="bg-yellow-400 hover:bg-yellow-300 transition-colors text-zinc-950 font-semibold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-3"
              >
                <Trophy className="h-5 w-5" />
                Ver Torneos Activos
              </Link>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-700 hover:bg-zinc-800 transition-colors text-white font-semibold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-5 w-5" />
                Unirse al Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jugadores Registrados", value: stats.players.toLocaleString() },
          { label: "Clanes Activos", value: stats.teams },
          { label: "Torneos Completados", value: stats.tournaments },
          { label: "Scrims Organizados", value: stats.scrims },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={i}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center"
          >
            <p className="text-4xl font-bold text-white tabular-nums">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* TORNEOS ACTIVOS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Torneos Activos</h2>
            <p className="text-zinc-500">Inscríbete antes de que se llenen</p>
          </div>
          <Link to="/tournaments" className="text-yellow-400 hover:underline text-sm flex items-center gap-1">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingTournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((t, i) => (
              <motion.div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h3 className="font-semibold text-white">{t.name}</h3>
                <p className="text-sm text-zinc-500">{t.mode}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
            <p className="text-zinc-500">No hay torneos activos en este momento.</p>
          </div>
        )}
      </section>

      {/* ANUNCIOS */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-yellow-400" /> Últimas Noticias
        </h2>
        <div className="space-y-4">
          {announcements.length > 0 ? announcements.map((a: any) => (
            <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 mb-1">{new Date(a.created_at).toLocaleDateString("es")}</p>
              <h3 className="font-semibold text-white mb-2">{a.title}</h3>
              <p className="text-sm text-zinc-400">{a.description}</p>
            </div>
          )) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-500">No hay anuncios recientes.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
