import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, ArrowLeft, CheckCircle, XCircle, UserMinus, Trophy, ShieldCheck, RefreshCw } from "lucide-react";
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

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Link to="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a Equipos
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-4xl">{clan.name}</CardTitle>
                <p className="text-muted-foreground">Líder: <span className="text-foreground">{clan.leader_nickname}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Creado el</p>
              <p className="font-medium">{new Date(clan.created_at).toLocaleDateString("es")}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{approvedMembers.length + 1}</p>
              <p className="text-muted-foreground text-sm mt-1">Miembros totales</p>
            </div>
          </CardContent>
        </Card>

        {isLeader && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Gestión de Clan</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/clan-leader-request" className="text-primary hover:underline">
                Editar información del clan →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

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
    </div>
  );
}
