import { useState, useEffect } from "react";
import { Trophy, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Champion {
  id: string;
  team_name: string;
  tournament_name: string;
  mode: string;
  date: string;
}

export default function RankingsPage() {
  const [loading, setLoading] = useState(true);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [rankings, setRankings] = useState<Record<string, { rank: number; name: string; wins: number }[]>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("tournament_champions").select("*").order("date", { ascending: false });
      const champs = (data as any[]) ?? [];
      setChampions(champs);

      // Build rankings per mode
      const modeWins: Record<string, Map<string, number>> = {};
      champs.forEach((c) => {
        if (!modeWins[c.mode]) modeWins[c.mode] = new Map();
        modeWins[c.mode].set(c.team_name, (modeWins[c.mode].get(c.team_name) || 0) + 1);
      });

      const result: Record<string, { rank: number; name: string; wins: number }[]> = {};
      Object.entries(modeWins).forEach(([mode, map]) => {
        const sorted = Array.from(map.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name, wins], i) => ({ rank: i + 1, name, wins }));
        result[mode] = sorted;
      });
      setRankings(result);
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = ["Solo", "Duo", "Trio", "Squad"];

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Rankings</h1>
        <p className="text-muted-foreground">Clasificaciones por campeonatos ganados por modo de juego.</p>
      </div>

      {/* Rankings by mode */}
      <div className="grid gap-6">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-semibold text-foreground mb-3">{cat}</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {rankings[cat] && rankings[cat].length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">#</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Victorias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings[cat].map((r) => (
                      <tr key={r.rank} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                        <td className="px-4 py-3 tabular-nums text-muted-foreground font-medium">{r.rank}</td>
                        <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                          {r.rank === 1 && <Trophy className="h-4 w-4 text-primary" />}
                          {r.name}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{r.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">Aún no hay datos de clasificación para {cat}.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Championship History */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" /> Historial de Campeonatos
        </h2>
        {champions.length > 0 ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Campeón</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Torneo</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Modo</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {champions.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" /> {c.team_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.tournament_name}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{c.mode}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-right">{new Date(c.date).toLocaleDateString("es")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">Aún no hay campeones registrados.</p>
        )}
      </section>
    </div>
  );
}
