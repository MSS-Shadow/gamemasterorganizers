import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, ArrowLeft, UserMinus, Trophy, ShieldCheck, RefreshCw, Crown, Megaphone, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Clan {
  id: string;
  name: string;
  leader_user_id: string;
  leader_nickname: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  nickname: string;
  status: string;
  joined_at: string;
}

interface JoinRequest {
  id: string;
  nickname: string;
  player_id: string;
  created_at: string;
}

export default function ClanPage() {
  const { clanName } = useParams<{ clanName: string }>();
  const { user } = useAuth();

  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [championships, setChampionships] = useState<any[]>([]);
  const [tournamentsPlayed, setTournamentsPlayed] = useState(0);

  const isLeader = user?.id === clan?.leader_user_id;

  const fetchClan = async () => {
    if (!clanName) return;
    const decoded = decodeURIComponent(clanName);

    const { data: clanData } = await supabase
      .from("clans")
      .select("*")
      .eq("name", decoded)
      .single();

    if (clanData) {
      setClan(clanData as Clan);

      const { data: membersData } = await supabase
        .from("clan_members")
        .select("*")
        .eq("clan_id", clanData.id)
        .order("joined_at", { ascending: false });

      setMembers(membersData || []);

      const { data: requestsData } = await supabase
        .from("clan_join_requests")
        .select("*")
        .eq("clan_name", decoded)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setJoinRequests(requestsData || []);

      const [champsRes, tourCountRes] = await Promise.all([
        supabase
          .from("tournament_champions")
          .select("*")
          .eq("team_name", decoded)
          .order("date", { ascending: false }),
        supabase
          .from("tournament_registrations")
          .select("tournament_id", { count: "exact", head: true })
          .eq("clan", decoded),
      ]);
      setChampionships(champsRes.data ?? []);
      setTournamentsPlayed(tourCountRes.count ?? 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClan();
  }, [clanName]);

  const acceptRequest = async (requestId: string, nickname: string) => {
    const { error: updateError } = await supabase
      .from("clan_join_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      toast.error("Error al aceptar la solicitud");
      return;
    }

    await supabase
      .from("profiles")
      .update({ clan: clan?.name })
      .eq("nickname", nickname);

    toast.success(`${nickname} ahora es miembro del clan`);
    fetchClan();
  };

  const rejectRequest = async (requestId: string, nickname: string) => {
    const { error } = await supabase
      .from("clan_join_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Solicitud de ${nickname} rechazada`);
    fetchClan();
  };

  const removeMember = async (memberId: string, nickname: string) => {
    if (!confirm(`¿Estás seguro de remover a ${nickname}?`)) return;

    const { error } = await supabase
      .from("clan_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${nickname} fue removido del clan`);
    fetchClan();
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando clan...</div>;
  if (!clan) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground mb-4">Clan no encontrado.</p>
      <Link to="/teams" className="text-primary hover:underline">← Volver a Equipos</Link>
    </div>
  );

  const approvedMembers = members.filter((m) => m.status === "member");
  const totalMembers = approvedMembers.length + 1;
  const wins = championships.length;
  const winrate = tournamentsPlayed > 0 ? Math.round((wins / tournamentsPlayed) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Link to="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a Equipos
      </Link>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card animate-fade-up">
        <div className="profile-banner h-36 md:h-44 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>
        <div className="relative px-6 pb-6 -mt-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-gaming-cyan p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-[1.3rem] bg-card flex items-center justify-center">
                <Crown className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-display text-foreground">{clan.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Líder: <Link to={`/player/${encodeURIComponent(clan.leader_nickname)}`} className="text-foreground hover:text-primary transition-colors">{clan.leader_nickname}</Link>
                {" · "}desde {new Date(clan.created_at).toLocaleDateString("es", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          {isLeader && (
            <Link to="/clan-leader-request" className="text-sm text-primary hover:underline whitespace-nowrap">
              Editar información →
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card-hover p-5 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-3xl font-black font-display stat-glow text-foreground tabular-nums">{totalMembers}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Miembros</p>
        </div>
        <div className="glass-card-hover p-5 text-center">
          <Trophy className="h-5 w-5 text-gaming-pink mx-auto mb-1" />
          <p className="text-3xl font-black font-display text-foreground tabular-nums">{wins}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Campeonatos</p>
        </div>
        <div className="glass-card-hover p-5 text-center">
          <Medal className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-3xl font-black font-display text-foreground tabular-nums">{tournamentsPlayed}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Torneos</p>
        </div>
        <div className="glass-card-hover p-5 text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-3xl font-black font-display text-foreground tabular-nums">{winrate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Winrate</p>
        </div>
      </div>

      {/* Recruitment banner */}
      {totalMembers < 8 && (
        <div className="relative overflow-hidden rounded-2xl glass-card p-5 md:p-6 border border-primary/30">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Este clan recluta jugadores</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Únete a <span className="text-foreground font-semibold">{clan.name}</span> y compite en torneos por equipos.
                </p>
              </div>
            </div>
            <Link to="/teams" className="glow-button px-5 py-2.5 rounded-xl text-primary-foreground font-semibold text-sm whitespace-nowrap">
              Solicitar unirse
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Miembros ({approvedMembers.length + 1})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-medium">{clan.leader_nickname}</span>
              </div>
              <Badge className="bg-primary/20 text-primary">Líder</Badge>
            </div>

            {approvedMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl">
                <Link to={`/player/${m.nickname}`} className="font-medium hover:text-primary transition-colors">
                  {m.nickname}
                </Link>
                {isLeader && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(m.id, m.nickname)}
                    className="text-destructive hover:text-destructive"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {isLeader && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Solicitudes Pendientes ({joinRequests.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchClan}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {joinRequests.length > 0 ? (
                <div className="space-y-3">
                  {joinRequests.map((req) => (
                    <div key={req.id} className="bg-muted/50 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-medium">{req.nickname}</p>
                        <p className="text-xs text-muted-foreground">ID: {req.player_id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(req.id, req.nickname)}
                        >
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectRequest(req.id, req.nickname)}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay solicitudes pendientes.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Championship history */}
      {championships.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gaming-pink" /> Campeonatos ganados
          </h3>
          <div className="space-y-2">
            {championships.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-gaming-pink" />
                  <div>
                    <p className="font-medium text-foreground">{c.tournament_name}</p>
                    <p className="text-xs text-muted-foreground">{c.mode} · {new Date(c.date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                {c.prize && <span className="text-xs font-semibold text-accent">{c.prize}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
