import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Megaphone, Zap, Users, Swords, ChevronRight, Gamepad2, Crown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ players: 0, teams: 0, tournaments: 0, scrims: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, clanRes, tourneyRes, scrimRes, annRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("clans").select("*", { count: "exact", head: true }),
          supabase.from("tournaments").select("*", { count: "exact", head: true }),
          supabase.from("scrims").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
        ]);

        setStats({
          players: (profileRes as any).count ?? 0,
          teams: (clanRes as any).count ?? 0,
          tournaments: (tourneyRes as any).count ?? 0,
          scrims: (scrimRes as any).count ?? 0,
        });
        setAnnouncements(annRes.data ?? []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    loadData();
  }, []);

  const statItems = [
    { label: "Jugadores", value: stats.players, icon: Users, color: "from-primary to-gaming-pink" },
    { label: "Clanes", value: stats.teams, icon: Crown, color: "from-gaming-cyan to-primary" },
    { label: "Torneos", value: stats.tournaments, icon: Trophy, color: "from-gaming-pink to-primary" },
    { label: "Scrims", value: stats.scrims, icon: Swords, color: "from-primary to-gaming-cyan" },
  ];

  const quickLinks = [
    { label: "Torneos", desc: "Compite y sube de ranking", path: "/tournaments", icon: Trophy },
    { label: "Scrims", desc: "Practica con tu equipo", path: "/scrims", icon: Swords },
    { label: "Rankings", desc: "Tabla de posiciones", path: "/rankings", icon: TrendingUp },
    { label: "Equipos", desc: "Encuentra tu clan", path: "/teams", icon: Users },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-mesh">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gaming-cyan/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Gamepad2 className="h-4 w-4" />
            BloodStrike LATAM
          </div>

          <h1 className="text-5xl md:text-7xl font-black font-display gradient-text leading-[1.1] mb-4">
            Game Master<br />Organizers
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8">
            La plataforma definitiva de torneos, scrims y rankings competitivos
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link to="/tournaments" className="glow-button px-8 py-3.5 rounded-xl text-primary-foreground font-semibold inline-flex items-center gap-2">
                  <Trophy className="h-5 w-5" /> Ver Torneos
                </Link>
                <Link to="/profile" className="glass-card px-8 py-3.5 rounded-xl text-foreground font-semibold inline-flex items-center gap-2 hover:border-primary/30 transition-colors">
                  Mi Perfil
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="glow-button px-8 py-3.5 rounded-xl text-primary-foreground font-semibold inline-flex items-center gap-2">
                  <Zap className="h-5 w-5" /> Unirse Ahora
                </Link>
                <Link to="/tournaments" className="glass-card px-8 py-3.5 rounded-xl text-foreground font-semibold inline-flex items-center gap-2 hover:border-primary/30 transition-colors">
                  Explorar <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {isAdmin && (
            <p className="mt-6 text-sm text-gaming-cyan font-medium">
              <Crown className="h-4 w-4 inline mr-1" /> Panel Admin disponible
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
          <div
            key={i}
            className="glass-card-hover p-6 text-center group"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-4xl font-black font-display stat-glow text-foreground">{stat.value}</p>
            <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-2xl font-bold font-display text-foreground mb-5 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" /> Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="glass-card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <link.icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground">{link.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-gaming-cyan" /> Últimas Noticias
          </h2>
          <Link to="/announcements" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div key={a.id} className="glass-card-hover p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(a.created_at).toLocaleDateString("es", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <h3 className="font-semibold text-foreground text-lg">{a.title}</h3>
                    <p className="text-muted-foreground mt-1.5 text-sm line-clamp-2">{a.description}</p>
                  </div>
                  {a.image_url && (
                    <img src={a.image_url} alt="" className="w-20 h-20 rounded-xl object-cover ml-4 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay anuncios por el momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
