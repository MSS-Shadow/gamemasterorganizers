import { useState, useEffect } from "react";
import { User, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  nickname: string;
  player_id: string;
  platform: string;
  clan: string;
  verified: boolean;
  tournaments: number;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("nickname, player_id, platform, clan, verified");
      const { data: regs } = await supabase.from("tournament_registrations").select("user_id, nickname");

      const regCount = new Map<string, number>();
      regs?.forEach((r: any) => { regCount.set(r.nickname, (regCount.get(r.nickname) || 0) + 1); });

      const list: Player[] = (profiles ?? []).map((p: any) => ({
        ...p,
        tournaments: regCount.get(p.nickname) || 0,
      }));

      setPlayers(list.sort((a, b) => b.tournaments - a.tournaments));
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Jugadores</h1>
        <p className="text-muted-foreground">Todos los jugadores registrados en la comunidad.</p>
      </div>

      {players.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["Jugador", "Player ID", "Plataforma", "Clan", "Torneos", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.player_id} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {p.nickname}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{p.player_id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{p.platform}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.clan || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{p.tournaments}</td>
                  <td className="px-4 py-3">
                    {p.verified ? (
                      <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verificado
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Aún no hay jugadores registrados.</p>
      )}
    </div>
  );
}
