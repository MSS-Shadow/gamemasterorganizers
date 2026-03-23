import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, ShieldCheck, Trophy, Medal, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PlayerData {
  id: string;
  user_id: string;
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
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [stats, setStats] = useState({ tournaments: 0, wins: 0, top3: 0, top10: 0 });
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ clan: "", country: "", platform: "" });

  useEffect(() => {
    const fetch = async () => {
      if (!nickname) return;
      const { data } = await supabase.from("profiles").select("*").eq("nickname", nickname).single();
      if (data) {
        setPlayer(data as any);
        setEditForm({ clan: (data as any).clan, country: (data as any).country, platform: (data as any).platform });

        const [tourRes, champRes, resultsRes] = await Promise.all([
          supabase.from("tournament_registrations").select("id", { count: "exact", head: true }).eq("nickname", nickname),
          supabase.from("tournament_champions").select("id", { count: "exact", head: true }).eq("team_name", (data as any).clan || nickname),
          supabase.from("tournament_results").select("*").eq("team_name", (data as any).clan || nickname).order("created_at", { ascending: false }).limit(10),
        ]);

        const results = (resultsRes.data as any[]) ?? [];
        const top3 = results.filter((r) => r.position <= 3).length;
        const top10 = results.filter((r) => r.position <= 10).length;

        setStats({ tournaments: tourRes.count ?? 0, wins: champRes.count ?? 0, top3, top10 });
        setRecentTournaments(results);
      }
      setLoading(false);
    };
    fetch();
  }, [nickname]);

  const isOwner = user?.id === player?.user_id;

  const saveProfile = async () => {
    if (!player) return;
    const { error } = await supabase.from("profiles").update(editForm).eq("id", player.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil actualizado");
    setPlayer({ ...player, ...editForm });
    setEditing(false);
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
          {isOwner && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar</Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Clan</label>
              <Input value={editForm.clan} onChange={(e) => setEditForm({ ...editForm, clan: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">País</label>
              <Input value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile} size="sm">Guardar</Button>
              <Button variant="outline" onClick={() => setEditing(false)} size="sm">Cancelar</Button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.tournaments}</p>
          <p className="text-xs text-muted-foreground">Torneos</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Medal className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.wins}</p>
          <p className="text-xs text-muted-foreground">Victorias</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.top3}</p>
          <p className="text-xs text-muted-foreground">Top 3</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Trophy className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{stats.top10}</p>
          <p className="text-xs text-muted-foreground">Top 10</p>
        </div>
      </div>

      {/* Recent Tournaments */}
      {recentTournaments.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">Torneos Recientes</h3>
          <div className="space-y-2">
            {recentTournaments.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-foreground">Posición #{r.position}</p>
                  <p className="text-xs text-muted-foreground">{r.kills} kills</p>
                </div>
                <span className="font-semibold text-foreground">{Number(r.total_points).toFixed(1)} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwner && (
        <div className="text-center">
          <Link to="/verify-account" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Solicitar Verificación de Cuenta
          </Link>
        </div>
      )}
    </div>
  );
}
