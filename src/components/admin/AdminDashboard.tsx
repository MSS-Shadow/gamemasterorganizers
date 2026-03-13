import { useState, useEffect } from "react";
import { Users, Trophy, Swords, TrendingUp, ShieldAlert } from "lucide-react";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, activeTournaments: 0, registrations: 0, creators: 0, scrims: 0, moderationActions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, tournaments, regs, roles, scrims, modLogs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tournaments").select("id, status"),
        supabase.from("tournament_registrations").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("scrims").select("id", { count: "exact", head: true }),
        supabase.from("moderation_logs").select("id", { count: "exact", head: true }),
      ]);
      const tourData = tournaments.data ?? [];
      setStats({
        players: profiles.count ?? 0,
        tournaments: tourData.length,
        activeTournaments: tourData.filter((t) => t.status === "Open").length,
        registrations: regs.count ?? 0,
        creators: roles.data?.filter((r) => r.role === "content_creator").length ?? 0,
        scrims: scrims.count ?? 0,
        moderationActions: modLogs.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Panel de Control</h2>
        <p className="text-muted-foreground text-sm">Vista general de la plataforma.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jugadores" value={stats.players} sub="Registrados" />
        <StatCard icon={Trophy} label="Torneos" value={stats.tournaments} sub="Creados" />
        <StatCard icon={Trophy} label="Torneos Activos" value={stats.activeTournaments} sub="Abiertos" />
        <StatCard icon={Swords} label="Inscripciones" value={stats.registrations} sub="Totales" />
        <StatCard icon={TrendingUp} label="Creadores" value={stats.creators} sub="Aprobados" />
        <StatCard icon={Swords} label="Scrims" value={stats.scrims} sub="Organizados" />
        <StatCard icon={ShieldAlert} label="Moderación" value={stats.moderationActions} sub="Acciones" />
      </div>
    </div>
  );
}
