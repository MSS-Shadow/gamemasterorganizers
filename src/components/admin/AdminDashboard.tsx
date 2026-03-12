import { useState, useEffect } from "react";
import { Users, Trophy, Swords, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, tournaments: 0, activeTournaments: 0, registrations: 0, creators: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, tournaments, regs, roles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tournaments").select("id, status"),
        supabase.from("tournament_registrations").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
      ]);
      const tourData = tournaments.data ?? [];
      setStats({
        players: profiles.count ?? 0,
        tournaments: tourData.length,
        activeTournaments: tourData.filter((t) => t.status === "Open").length,
        registrations: regs.count ?? 0,
        creators: roles.data?.filter((r) => r.role === "content_creator").length ?? 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Overview of the platform.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Players" value={stats.players} sub="Registered" />
        <StatCard icon={Trophy} label="Tournaments" value={stats.tournaments} sub="Created" />
        <StatCard icon={Trophy} label="Active Tournaments" value={stats.activeTournaments} sub="Open" />
        <StatCard icon={Swords} label="Registrations" value={stats.registrations} sub="Total" />
        <StatCard icon={TrendingUp} label="Creators" value={stats.creators} sub="Approved" />
      </div>
    </div>
  );
}
