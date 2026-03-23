import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface TournamentResult {
  id: string;
  tournament_id: string;
  tournament_name: string;
  date: string;
  mode: string;
  results: { team_name: string; total_points: number; position: number; kills: number }[];
  total_players: number;
}

export default function TournamentHistoryPage() {
  const [tournaments, setTournaments] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: tours } = await supabase.from("tournaments").select("*").eq("status", "Finished").order("date", { ascending: false });
      const { data: results } = await supabase.from("tournament_results").select("*").order("total_points", { ascending: false });
      const { data: regs } = await supabase.from("tournament_registrations").select("tournament_id");
      const { data: champions } = await supabase.from("tournament_champions").select("*");

      const regCounts: Record<string, number> = {};
      regs?.forEach((r: any) => { regCounts[r.tournament_id] = (regCounts[r.tournament_id] || 0) + 1; });

      const mapped: TournamentResult[] = (tours ?? []).map((t: any) => {
        const tResults = (results ?? []).filter((r: any) => r.tournament_id === t.id).map((r: any) => ({
          team_name: r.team_name,
          total_points: Number(r.total_points),
          position: r.position,
          kills: r.kills,
        }));
        // If no results, check champions
        if (tResults.length === 0) {
          const champ = (champions ?? []).find((c: any) => c.tournament_id === t.id);
          if (champ) tResults.push({ team_name: (champ as any).team_name, total_points: 0, position: 1, kills: 0 });
        }
        return {
          id: t.id,
          tournament_id: t.id,
          tournament_name: t.name,
          date: t.date,
          mode: t.mode,
          results: tResults,
          total_players: regCounts[t.id] || 0,
        };
      });

      setTournaments(mapped);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Historial de Torneos</h1>
        <p className="text-muted-foreground">Resultados de torneos finalizados.</p>
      </div>

      {tournaments.length > 0 ? (
        <div className="space-y-4">
          {tournaments.map((t) => {
            const top3 = t.results.slice(0, 3);
            return (
              <div key={t.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Link to={`/tournaments/${encodeURIComponent(t.tournament_name.replace(/ /g, "-"))}`} className="font-semibold text-foreground hover:text-primary">
                      {t.tournament_name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{t.mode} · {new Date(t.date).toLocaleDateString("es")} · {t.total_players} jugadores</p>
                  </div>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                {top3.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {top3.map((r, i) => (
                      <div key={i} className={`rounded-lg p-3 text-center text-sm ${i === 0 ? "bg-primary/10 border border-primary/30" : "bg-muted/50"}`}>
                        <Medal className={`h-4 w-4 mx-auto mb-1 ${i === 0 ? "text-primary" : i === 1 ? "text-muted-foreground" : "text-muted-foreground/70"}`} />
                        <p className="font-medium text-foreground truncate">{r.team_name}</p>
                        {r.total_points > 0 && <p className="text-xs text-muted-foreground">{r.total_points} pts</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">No hay torneos finalizados aún.</p>
      )}
    </div>
  );
}
