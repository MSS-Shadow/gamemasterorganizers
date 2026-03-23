import { useState, useEffect } from "react";
import { Trophy, CalendarDays, Swords, Megaphone, Crown, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import LobbyProgress from "@/components/LobbyProgress";
import { supabase } from "@/integrations/supabase/client";
import heroBanner from "@/assets/hero-banner.jpg";
import charactersAction from "@/assets/characters-action.jpg";
import characterCyber from "@/assets/character-cyber.jpg";

export default function HomePage() {
  const [stats, setStats] = useState({ tournaments: 0, scrims: 0, upcoming: 0, players: 0, teams: 0 });
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [liveScrims, setLiveScrims] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [tourRes, profileRes, scrimRes, regsRes, clansRes, annRes] = await Promise.all([
        supabase.from("tournaments").select("*").order("date", { ascending: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("scrims").select("*").order("date", { ascending: false }).limit(5),
        supabase.from("tournament_registrations").select("tournament_id"),
        supabase.from("clans").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
      ]);

      const tours = tourRes.data ?? [];
      const scrims = scrimRes.data ?? [];
      const openTours = tours.filter((t) => t.status === "Open");

      const counts: Record<string, number> = {};
      regsRes.data?.forEach((r) => { counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1; });
      setRegCounts(counts);

      setUpcomingTournaments(openTours.slice(0, 3));
      setLiveScrims(scrims.filter((s: any) => s.status === "live").slice(0, 3));
      setAnnouncements((annRes.data as any[]) ?? []);
      setStats({
        tournaments: tours.filter((t) => t.status === "Finished").length,
        scrims: scrims.length,
        upcoming: openTours.length,
        players: profileRes.count ?? 0,
        teams: clansRes.count ?? 0,
      });
    };
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img src={heroBanner} alt="BloodStrike Hero" className="w-full h-[280px] md:h-[400px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Game Master Organizers</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground text-balance mb-3">
            Torneos Competitivos.{" "}
            <span className="text-primary">Inscríbete Ahora.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mb-5 text-sm md:text-base">
            Game Master Organizers es una plataforma competitiva dedicada a organizar torneos y scrims para la comunidad de BloodStrike.
          </p>
          <Link to="/tournaments" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:brightness-110 active:scale-95 transition-all">
            Ver Torneos
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Jugadores" value={stats.players} sub="Registrados" />
        <StatCard icon={Users} label="Equipos" value={stats.teams} sub="Registrados" />
        <StatCard icon={Trophy} label="Torneos" value={stats.tournaments} sub="Jugados" />
        <StatCard icon={Swords} label="Scrims" value={stats.scrims} sub="Organizados" />
        <StatCard icon={CalendarDays} label="Próximos" value={stats.upcoming} sub="Eventos" />
      </div>

      {/* Latest News */}
      {announcements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Últimas Noticias</h2>
            <Link to="/announcements" className="text-sm text-accent hover:underline">Ver todos</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {announcements.map((a: any) => (
              <div key={a.id} className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">{new Date(a.created_at).toLocaleDateString("es")}</p>
                <h3 className="font-semibold text-foreground text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Images Strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative rounded-lg overflow-hidden border border-border aspect-[16/9]">
          <img src={charactersAction} alt="BloodStrike Characters" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Competitivo</p>
            <p className="text-sm font-bold text-foreground">Únete a la Batalla</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden border border-border aspect-[16/9]">
          <img src={characterCyber} alt="BloodStrike Character" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Comunidad</p>
            <p className="text-sm font-bold text-foreground">{stats.players}+ Jugadores</p>
          </div>
        </div>
      </div>

      {/* Upcoming Tournaments */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Torneos</h2>
        {upcomingTournaments.length > 0 ? (
          <div className="space-y-4">
            {upcomingTournaments.map((t: any) => (
              <div key={t.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.mode} · {new Date(t.date).toLocaleDateString("es")}</p>
                    <p className="text-xs text-muted-foreground">{regCounts[t.id] || 0} inscritos · {t.max_players - (regCounts[t.id] || 0)} lugares disponibles</p>
                  </div>
                  <Link to={`/tournaments/${encodeURIComponent(t.name.replace(/ /g, "-"))}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all self-start">
                    Inscribirse
                  </Link>
                </div>
                <LobbyProgress current={regCounts[t.id] || 0} max={t.max_players} label="Lobby 1" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay torneos próximos por el momento.</p>
        )}
      </section>

      {/* Active Scrims */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Scrims Activos</h2>
          <Link to="/scrims" className="text-sm text-accent hover:underline">Ver todos</Link>
        </div>
        {liveScrims.length > 0 ? (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {liveScrims.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground">por {s.creator_nickname} · {s.mode}</p>
                </div>
                <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">EN VIVO</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay scrims activos en este momento.</p>
        )}
      </section>
    </div>
  );
}
