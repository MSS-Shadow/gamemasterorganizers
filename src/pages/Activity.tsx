import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityEntry {
  nickname: string;
  tournaments: number;
  scrims: number;
}

export default function ActivityPage() {
  const [data, setData] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: regs } = await supabase.from("tournament_registrations").select("user_id, nickname");
      const { data: scrimParts } = await supabase.from("scrim_participants").select("user_id, nickname");

      const map = new Map<string, { nickname: string; tournaments: number; scrims: number }>();

      regs?.forEach((r: any) => {
        const e = map.get(r.user_id) || { nickname: r.nickname, tournaments: 0, scrims: 0 };
        e.tournaments++;
        map.set(r.user_id, e);
      });

      scrimParts?.forEach((s: any) => {
        const e = map.get(s.user_id) || { nickname: s.nickname, tournaments: 0, scrims: 0 };
        e.scrims++;
        map.set(s.user_id, e);
      });

      const sorted = Array.from(map.values()).sort((a, b) => (b.tournaments + b.scrims) - (a.tournaments + a.scrims));
      setData(sorted);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tabla de Actividad</h1>
          <p className="text-muted-foreground">Jugadores más activos por participación.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {data.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">#</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Jugador</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Torneos</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Scrims</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground font-bold">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.nickname}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{p.tournaments}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{p.scrims}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground font-semibold text-right">{p.tournaments + p.scrims}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-muted-foreground py-12">Aún no hay datos de actividad.</p>
        )}
      </div>
    </div>
  );
}
