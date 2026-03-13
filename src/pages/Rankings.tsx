import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function RankingsPage() {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<Record<string, { rank: number; name: string; wins: number }[]>>({});

  useEffect(() => {
    const fetch = async () => {
      // Get completed tournaments and their registrations to build rankings
      // For now, show empty state until tournaments have results
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = ["Solo", "Duo", "Trio", "Squad"];

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Rankings</h1>
        <p className="text-muted-foreground">Clasificaciones por campeonatos ganados por modo de juego.</p>
      </div>

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
    </div>
  );
}
