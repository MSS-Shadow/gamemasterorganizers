import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, ShieldCheck, Trophy, Medal, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface PlayerData {
  nickname: string;
  player_id: string;
  platform: string;
  clan: string;
  country: string;
  verified: boolean;
  status: string;
  created_at: string;
}

export default function PlayerProfile() {
  const { nickname } = useParams<{ nickname: string }>();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [stats, setStats] = useState({ tournaments: 0, wins: 0, topFinishes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!nickname) return;
      const { data } = await supabase.from("profiles").select("*").eq("nickname", nickname).single();
      if (data) {
        setPlayer(data as any);
        // Get tournament count
        const { count: tourCount } = await supabase.from("tournament_registrations").select("id", { count: "exact", head: true }).eq("nickname", nickname);
        // Get wins from champions
        const { count: winCount } = await supabase.from("tournament_champions").select("id", { count: "exact", head: true }).eq("team_name", data.clan || nickname);
        setStats({ tournaments: tourCount ?? 0, wins: winCount ?? 0, topFinishes: 0 });
      }
      setLoading(false);
    };
    fetch();
  }, [nickname]);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;
  if (!player) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground mb-4">Jugador no encontrado.</p>
      <Link to="/players" className="text-primary hover:underline">← Volver a Jugadores</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a Jugadores
      </Link>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {player.nickname}
              {player.verified && <ShieldCheck className="h-5 w-5 text-accent" />}
            </h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{player.platform}</Badge>
              {player.clan && <Badge variant="secondary">{player.clan}</Badge>}
              <Badge variant="outline">{player.country}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{player.player_id}</p>
            <p className="text-muted-foreground">Player ID</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{new Date(player.created_at).toLocaleDateString("es")}</p>
            <p className="text-muted-foreground">Miembro desde</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.tournaments}</p>
          <p className="text-xs text-muted-foreground">Torneos Jugados</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 text-center">
          <Medal className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.wins}</p>
          <p className="text-xs text-muted-foreground">Victorias</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 text-center">
          <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.topFinishes}</p>
          <p className="text-xs text-muted-foreground">Top Finishes</p>
        </div>
      </div>
    </div>
  );
}
