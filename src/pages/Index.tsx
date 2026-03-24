import { useState, useEffect } from "react";
import {
  Trophy, CalendarDays, Swords, Megaphone, Crown, Users,
  Shield, AlertTriangle, CheckCircle, FileWarning, ExternalLink,
  MessageCircle, Star, ChevronRight, Award, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function HomePage() {
  const [stats, setStats] = useState({ tournaments: 0, scrims: 0, upcoming: 0, players: 0, teams: 0 });
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [liveScrims, setLiveScrims] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [champions, setChampions] = useState<any[]>([]);
  const [topTeams, setTopTeams] = useState<{ name: string; wins: number }[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, any>>({});
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [tourRes, profileRes, scrimRes, regsRes, clansRes, annRes, champRes, creatorRes, configRes, resultsRes] = await Promise.all([
        supabase.from("tournaments").select("*").order("date", { ascending: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("scrims").select("*").order("date", { ascending: false }).limit(5),
        supabase.from("tournament_registrations").select("tournament_id"),
        supabase.from("clans").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("tournament_champions").select("*").order("date", { ascending: false }),
        supabase.from("creator_requests").select("nickname, platform, channel_link").eq("status", "Approved"),
        supabase.from("site_config").select("*"),
        supabase.from("tournament_results").select("*, tournaments(name, mode, date)").order("total_points", { ascending: false }).limit(10),
      ]);

      const tours = tourRes.data ?? [];
      const scrims = scrimRes.data ?? [];
      const openTours = tours.filter((t) => t.status === "Open");
      const champs = (champRes.data as any[]) ?? [];

      const counts: Record<string, number> = {};
      regsRes.data?.forEach((r) => { counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1; });
      setRegCounts(counts);

      // Build top teams from champions
      const teamWins = new Map<string, number>();
      champs.forEach((c) => teamWins.set(c.team_name, (teamWins.get(c.team_name) || 0) + 1));
      setTopTeams(Array.from(teamWins.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, wins]) => ({ name, wins })));

      // Parse site config
      const cfg: Record<string, any> = {};
      (configRes.data ?? []).forEach((row: any) => { cfg[row.key] = row.value; });
      setSiteConfig(cfg);

      setChampions(champs);
      setUpcomingTournaments(openTours.slice(0, 3));
      setLiveScrims(scrims.filter((s: any) => s.status === "live").slice(0, 3));
      setAnnouncements((annRes.data as any[]) ?? []);
      setCreators((creatorRes.data as any[]) ?? []);
      setResults((resultsRes.data as any[]) ?? []);
      setStats({
        tournaments: tours.filter((t) => t.status === "Finished").length,
        scrims: scrims.length,
        upcoming: openTours.length,
        players: profileRes.count ?? 0,
        teams: clansRes.count ?? 0,
      });
    };
    load();
  }, []);

  const heroStats = siteConfig.hero_stats || {};
  const discordLink = siteConfig.discord_link || "https://discord.gg";

  return (
    <div className="space-y-12">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative rounded-xl overflow-hidden border border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative px-6 py-12 md:px-12 md:py-20">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl space-y-5">
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Game Master Organizers</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Competitivo BloodStrike{" "}
              <span className="text-primary">LATAM</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-sm md:text-base max-w-xl">
              Torneos, scrims y rankings con premios reales. La comunidad competitiva más activa de BloodStrike en Latinoamérica.
            </motion.p>

            {/* Hero stat counters */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-6 pt-2">
              {[
                { value: stats.tournaments || "0", label: "Torneos Organizados" },
                { value: stats.teams || "0", label: "Equipos" },
                { value: heroStats.prizes_delivered || "$0", label: "Premios Entregados" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-3 pt-2">
              <a href={typeof discordLink === "string" ? discordLink : "https://discord.gg"} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[hsl(235,86%,65%)] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
                <MessageCircle className="h-4 w-4" /> Unirse al Discord
              </a>
              <Link to="/tournaments"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
                <Trophy className="h-4 w-4" /> Ver Torneos
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TORNEOS REALIZADOS (LEGITIMIDAD) ═══════════ */}
      <section>
        <SectionHeader icon={Crown} title="Torneos Realizados" subtitle="Historial verificable de torneos completados con premios reales" link="/tournament-history" linkLabel="Ver historial completo" />
        {champions.length > 0 ? (
          <div className="grid gap-3">
            {champions.slice(0, 6).map((c: any) => (
              <div key={c.id} className="bg-card border border-border rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{c.tournament_name}</p>
                    <p className="text-xs text-muted-foreground">{c.mode} · {new Date(c.date).toLocaleDateString("es", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" /> {c.team_name}
                  </span>
                  {c.prize && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{c.prize}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.sponsor_tag === "Patrocinado" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {c.sponsor_tag || "Comunitario"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Los torneos completados aparecerán aquí." />
        )}
      </section>

      {/* ═══════════ ACTIVIDAD ACTUAL ═══════════ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Tournaments */}
        <section>
          <SectionHeader icon={CalendarDays} title="Torneos Activos" link="/tournaments" linkLabel="Ver todos" />
          {upcomingTournaments.length > 0 ? (
            <div className="space-y-3">
              {upcomingTournaments.map((t: any) => (
                <div key={t.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{t.mode} · {new Date(t.date).toLocaleDateString("es")}</p>
                      <p className="text-xs text-muted-foreground">{regCounts[t.id] || 0}/{t.max_players} inscritos</p>
                    </div>
                    <Link to={`/tournaments/${encodeURIComponent(t.name.replace(/ /g, "-"))}`}
                      className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-semibold hover:brightness-110 transition-all">
                      Inscribirse
                    </Link>
                  </div>
                  <LobbyProgress current={regCounts[t.id] || 0} max={t.max_players} label="Lobby 1" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No hay torneos activos." />
          )}
        </section>

        {/* Scrims + Announcements */}
        <div className="space-y-6">
          <section>
            <SectionHeader icon={Swords} title="Scrims Abiertas" link="/scrims" linkLabel="Ver todas" />
            {liveScrims.length > 0 ? (
              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                {liveScrims.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">por {s.creator_nickname} · {s.mode}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs font-bold uppercase">En Vivo</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No hay scrims en vivo." />
            )}
          </section>

          {announcements.length > 0 && (
            <section>
              <SectionHeader icon={Megaphone} title="Últimas Noticias" link="/announcements" linkLabel="Ver todas" />
              <div className="space-y-2">
                {announcements.map((a: any) => (
                  <div key={a.id} className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">{new Date(a.created_at).toLocaleDateString("es")}</p>
                    <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ═══════════ ÚLTIMOS RESULTADOS ═══════════ */}
      {results.length > 0 && (
        <section>
          <SectionHeader icon={Award} title="Últimos Resultados" link="/results" linkLabel="Ver todos" />
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Equipo</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Kills</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((r: any, i: number) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{r.position || i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.team_name}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground text-right">{r.kills}</td>
                    <td className="px-4 py-2.5 tabular-nums text-primary font-semibold text-right">{Number(r.total_points).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══════════ RANKING ═══════════ */}
      <section>
        <SectionHeader icon={Crown} title="Top Equipos" link="/rankings" linkLabel="Ver ranking completo" />
        {topTeams.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {topTeams.map((t, i) => (
              <div key={t.name} className={`bg-card border rounded-lg p-4 text-center ${i === 0 ? "border-primary" : "border-border"}`}>
                <p className="text-2xl font-bold tabular-nums text-foreground">{i + 1}°</p>
                <p className="font-semibold text-foreground text-sm mt-1">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.wins} victoria{t.wins !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Los rankings aparecerán cuando se registren campeones." />
        )}
      </section>

      {/* ═══════════ SISTEMA COMPETITIVO ═══════════ */}
      <section>
        <SectionHeader icon={Shield} title="Sistema Competitivo" subtitle="Integridad y fair play garantizados" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: AlertTriangle, title: "Anti-Smurf", desc: "Detección automática de cuentas sospechosas con rendimiento inusual." },
            { icon: FileWarning, title: "Reportes", desc: "Sistema de denuncias con evidencia para cheating, toxicidad y multi-cuenta.", link: "/report" },
            { icon: Shield, title: "Sanciones", desc: "Suspensiones y baneos gestionados por administradores con registro público." },
            { icon: CheckCircle, title: "Verificación", desc: "Los jugadores pueden verificar su cuenta con captura del perfil BloodStrike.", link: "/verify-account" },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-lg p-5">
              <div className="p-2 rounded-md bg-primary/10 w-fit mb-3">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              {item.link && (
                <Link to={item.link} className="text-xs text-accent hover:underline mt-2 inline-flex items-center gap-1">
                  Más info <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ COMUNIDAD ═══════════ */}
      <section>
        <SectionHeader icon={Users} title="Comunidad" subtitle="Creadores, líderes y jugadores activos" />
        <div className="grid md:grid-cols-3 gap-4">
          {/* Stat cards */}
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.players}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Jugadores Registrados</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.teams}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Equipos / Clanes</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <Star className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground tabular-nums">{creators.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Creadores de Contenido</p>
          </div>
        </div>

        {/* Content Creators */}
        {creators.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Creadores de Contenido</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {creators.slice(0, 6).map((c: any) => (
                <div key={c.nickname} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{c.nickname}</p>
                    <p className="text-xs text-muted-foreground">{c.platform}</p>
                  </div>
                  <a href={c.channel_link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
        <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">¿Listo para competir?</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          Regístrate, únete a un equipo y demuestra tu nivel en los torneos de BloodStrike LATAM.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:brightness-110 transition-all">
            Crear Cuenta
          </Link>
          <a href={typeof discordLink === "string" ? discordLink : "https://discord.gg"} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-muted transition-all">
            <MessageCircle className="h-4 w-4" /> Discord
          </a>
        </div>
      </section>
    </div>
  );
}

/* ── Reusable helpers ── */
function SectionHeader({ icon: Icon, title, subtitle, link, linkLabel }: { icon: any; title: string; subtitle?: string; link?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="text-xs text-accent hover:underline flex items-center gap-1">
          {linkLabel} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
