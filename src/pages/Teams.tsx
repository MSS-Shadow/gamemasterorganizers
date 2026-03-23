import { useState, useEffect } from "react";
import { Users, Plus, Trophy, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ClanInfo {
  id: string;
  name: string;
  leader_nickname: string;
  memberCount: number;
  wins: number;
}

export default function TeamsPage() {
  const { user } = useAuth();
  const [clans, setClans] = useState<ClanInfo[]>([]);
  const [legacyTeams, setLegacyTeams] = useState<{ name: string; players: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [clansRes, membersRes, championsRes, profilesRes] = await Promise.all([
        supabase.from("clans").select("*"),
        supabase.from("clan_members").select("clan_id").eq("status", "member"),
        supabase.from("tournament_champions").select("team_name"),
        supabase.from("profiles").select("nickname, clan"),
      ]);

      const memberCounts = new Map<string, number>();
      membersRes.data?.forEach((m: any) => { memberCounts.set(m.clan_id, (memberCounts.get(m.clan_id) || 0) + 1); });

      const winCounts = new Map<string, number>();
      championsRes.data?.forEach((c: any) => { winCounts.set(c.team_name, (winCounts.get(c.team_name) || 0) + 1); });

      const clanList: ClanInfo[] = (clansRes.data as any[] ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        leader_nickname: c.leader_nickname,
        memberCount: (memberCounts.get(c.id) || 0) + 1,
        wins: winCounts.get(c.name) || 0,
      }));
      setClans(clanList);

      // Legacy teams
      const clanNames = new Set(clanList.map((c) => c.name));
      const clanMap = new Map<string, Set<string>>();
      profilesRes.data?.forEach((p: any) => {
        if (p.clan && !clanNames.has(p.clan)) {
          if (!clanMap.has(p.clan)) clanMap.set(p.clan, new Set());
          clanMap.get(p.clan)!.add(p.nickname);
        }
      });
      setLegacyTeams(Array.from(clanMap.entries()).map(([name, players]) => ({ name, players: Array.from(players) })));
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  const featuredClans = [...clans].sort((a, b) => b.wins - a.wins || b.memberCount - a.memberCount).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Equipos / Clanes</h1>
          <p className="text-muted-foreground">Clanes registrados y sus miembros.</p>
        </div>
        {user && (
          <Link to="/clan-leader-request" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
            <Plus className="h-4 w-4" /> Solicitar Líder
          </Link>
        )}
      </div>

      {/* Featured Clans */}
      {featuredClans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Clanes Destacados
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredClans.map((c) => (
              <Link key={c.id} to={`/teams/${encodeURIComponent(c.name)}`} className="bg-card border-2 border-primary/30 rounded-lg p-5 hover:border-primary/60 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">Líder: {c.leader_nickname}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="font-bold text-foreground">{c.memberCount}</p>
                    <p className="text-xs text-muted-foreground">Miembros</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="font-bold text-foreground">{c.wins}</p>
                    <p className="text-xs text-muted-foreground">Victorias</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Clans */}
      {clans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Todos los Clanes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {clans.map((c) => (
              <Link key={c.id} to={`/teams/${encodeURIComponent(c.name)}`} className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">Líder: {c.leader_nickname}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.memberCount} miembros · {c.wins} victorias</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {legacyTeams.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Otros Equipos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {legacyTeams.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.players.length} jugadores</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.players.map((p) => (
                    <Link key={p} to={`/player/${p}`} className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground hover:text-primary">{p}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {clans.length === 0 && legacyTeams.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Aún no hay equipos registrados.</p>
      )}
    </div>
  );
}
