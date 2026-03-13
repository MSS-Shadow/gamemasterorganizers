import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  name: string;
  players: string[];
  tournaments: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Build teams from profiles grouped by clan
      const { data: profiles } = await supabase.from("profiles").select("nickname, clan");
      const { data: regs } = await supabase.from("tournament_registrations").select("tournament_team_name, nickname");

      const clanMap = new Map<string, Set<string>>();
      const tournamentCount = new Map<string, number>();

      profiles?.forEach((p: any) => {
        if (p.clan) {
          if (!clanMap.has(p.clan)) clanMap.set(p.clan, new Set());
          clanMap.get(p.clan)!.add(p.nickname);
        }
      });

      regs?.forEach((r: any) => {
        tournamentCount.set(r.tournament_team_name, (tournamentCount.get(r.tournament_team_name) || 0) + 1);
      });

      const teamList: Team[] = Array.from(clanMap.entries()).map(([name, players]) => ({
        name,
        players: Array.from(players),
        tournaments: tournamentCount.get(name) || 0,
      }));

      setTeams(teamList.sort((a, b) => b.tournaments - a.tournaments));
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Equipos</h1>
        <p className="text-muted-foreground">Equipos registrados y su historial competitivo.</p>
      </div>

      {teams.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.players.length} jugadores</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {t.players.map((p) => (
                  <span key={p} className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground">{p}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t.tournaments} participaciones en torneos</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Aún no hay equipos registrados.</p>
      )}
    </div>
  );
}
