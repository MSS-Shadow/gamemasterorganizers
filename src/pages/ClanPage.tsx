import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, ArrowLeft, CheckCircle, XCircle, UserMinus, Trophy, ShieldCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  status: string;
  created_at: string;
}

export default function ClanPage() {
  const { clanName } = useParams<{ clanName: string }>();
  const { user } = useAuth();
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [clanStats, setClanStats] = useState({ tournaments: 0, wins: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);

  const isLeader = user?.id === clan?.leader_user_id;
  const isMember = members.some((m) => m.user_id === user?.id);

  const fetchClan = async () => {
    if (!clanName) return;
    const decoded = decodeURIComponent(clanName);

    // Cargar clan y miembros (tu lógica original)
    const { data: clanData } = await supabase.from("clans").select("*").eq("name", decoded).single();
    if (clanData) {
      setClan(clanData as any);

      const { data: membersData } = await supabase
        .from("clan_members")
        .select("*")
        .eq("clan_id", (clanData as any).id)
        .order("joined_at");

      setMembers((membersData as any[]) ?? []);

      // Estadísticas
      const { data: champions } = await supabase
        .from("tournament_champions")
        .select("*")
        .eq("team_name", decoded)
        .order("date", { ascending: false });

      const { data: results } = await supabase
        .from("tournament_results")
        .select("*")
        .eq("team_name", decoded)
        .order("created_at", { ascending: false })
        .limit(10);

      setClanStats({
        tournaments: (results as any[])?.length ?? 0,
        wins: (champions as any[])?.length ?? 0,
      });
      setRecentResults((results as any[]) ?? []);
    }

    // NUEVO: Cargar solicitudes del nuevo sistema (registro)
    const { data: requestsData } = await supabase
      .from("clan_join_requests")
      .select("*")
      .eq("clan_name", decoded)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setJoinRequests((requestsData as any[]) ?? []);

    setLoading(false);
  };

  useEffect(() => {
    fetchClan();
  }, [clanName]);

  // Solicitar unirse (ahora usa el nuevo sistema)
  const requestJoin = async () => {
    if (!user || !clan) return;
    setJoining(true);

    const { data: profile } = await supabase.from("profiles").select("nickname, player_id").eq("user_id", user.id).single();

    if (!profile) {
      toast.error("Necesitas completar tu perfil primero");
      setJoining(false);
      return;
    }

    const { error } = await supabase.from("clan_join_requests").insert({
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      clan_name: clan.name,
    });

    setJoining(false);

    if (error) {
      if (error.code === "23505") toast.error("Ya enviaste una solicitud");
      else toast.error(error.message);
      return;
    }

    toast.success("✅ Solicitud enviada al líder del clan");
    fetchClan();
  };

  // Aceptar solicitud (nuevo sistema)
  const acceptRequest = async (requestId: string, nickname: string) => {
    const { error: updateError } = await supabase
      .from("clan_join_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      toast.error("Error al aceptar");
      return;
    }

    // Asignar clan al jugador
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ clan: clan?.name })
      .eq("nickname", nickname);

    if (profileError) {
      toast.error("Error al actualizar perfil");
      return;
    }

    toast.success(`✅ ${nickname} ahora es miembro del clan`);
    fetchClan();
  };

  // Rechazar solicitud
  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("clan_join_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("❌ Solicitud rechazada");
    fetchClan();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("clan_members").delete().eq("id", memberId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Miembro removido");
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a Equipos
      </Link>

      {/* Header del clan */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{clan.name}</h1>
              <p className="text-sm text-muted-foreground">Líder: {clan.leader_nickname}</p>
            </div>
          </div>
          {!isMember && !isLeader && user && (
            <Button onClick={requestJoin} disabled={joining} size="sm">
              {joining ? "Enviando..." : "Solicitar Unirse"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-foreground">{approvedMembers.length + 1}</p>
            <p className="text-muted-foreground">Miembros</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-foreground">{clanStats.wins}</p>
            <p className="text-muted-foreground">Victorias</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-foreground">{clanStats.tournaments}</p>
            <p className="text-muted-foreground">Torneos</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Tab Miembros - con solicitudes mejoradas */}
        <TabsContent value="members">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Miembros ({approvedMembers.length + 1})</h3>

            {/* Lista de miembros */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground flex items-center gap-2">
                  {clan.leader_nickname} <Badge className="bg-primary/20 text-primary text-xs">Líder</Badge>
                </span>
              </div>
              {approvedMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Link to={`/player/${m.nickname}`} className="font-medium text-foreground hover:text-primary">
                    {m.nickname}
                  </Link>
                  {isLeader && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMember(m.id)}>
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* NUEVA SECCIÓN: Solicitudes pendientes del registro */}
            {isLeader && joinRequests.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Solicitudes pendientes ({joinRequests.length})</h3>
                  <Button variant="ghost" size="sm" onClick={fetchClan}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
                  </Button>
                </div>
                <div className="space-y-3">
                  {joinRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{req.nickname}</p>
                        <p className="text-xs text-muted-foreground">ID: {req.player_id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => acceptRequest(req.id, req.nickname)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Aceptar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejectRequest(req.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overview">
          {/* tu contenido original de overview */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Clan creado el {new Date(clan.created_at).toLocaleDateString("es")}.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground flex items-center gap-2">
                  {clan.leader_nickname} <Badge className="bg-primary/20 text-primary text-xs">Líder</Badge>
                </span>
              </div>
              {approvedMembers.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                  <Link to={`/player/${m.nickname}`} className="font-medium text-foreground hover:text-primary">
                    {m.nickname}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {/* tu contenido original de historial */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">Historial de Torneos</h3>
            {recentResults.length > 0 ? (
              <div className="space-y-2">
                {recentResults.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-foreground">{r.team_name}</p>
                      <p className="text-xs text-muted-foreground">Posición #{r.position} · {r.kills} kills</p>
                    </div>
                    <span className="font-semibold text-foreground">{Number(r.total_points).toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No hay resultados de torneos aún.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
