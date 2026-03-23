import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, ArrowLeft, CheckCircle, XCircle, UserMinus, Trophy, ShieldCheck } from "lucide-react";
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

export default function ClanPage() {
  const { clanName } = useParams<{ clanName: string }>();
  const { user } = useAuth();
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [clanStats, setClanStats] = useState({ tournaments: 0, wins: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);

  const isLeader = user?.id === clan?.leader_user_id;
  const isMember = members.some((m) => m.user_id === user?.id);

  const fetchClan = async () => {
    if (!clanName) return;
    const decoded = decodeURIComponent(clanName);
    const { data: clanData } = await supabase.from("clans").select("*").eq("name", decoded).single();
    if (clanData) {
      setClan(clanData as any);
      const { data: membersData } = await supabase.from("clan_members").select("*").eq("clan_id", (clanData as any).id).order("joined_at");
      setMembers((membersData as any[]) ?? []);

      // Get clan tournament history
      const { data: champions } = await supabase.from("tournament_champions").select("*").eq("team_name", decoded).order("date", { ascending: false });
      const { data: results } = await supabase.from("tournament_results").select("*").eq("team_name", decoded).order("created_at", { ascending: false }).limit(10);

      setClanStats({
        tournaments: (results as any[])?.length ?? 0,
        wins: (champions as any[])?.length ?? 0,
      });
      setRecentResults((results as any[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClan(); }, [clanName]);

  const requestJoin = async () => {
    if (!user || !clan) return;
    const { data: profile } = await supabase.from("profiles").select("nickname").eq("user_id", user.id).single();
    if (!profile) { toast.error("Necesitas un perfil"); return; }
    setJoining(true);
    const { error } = await supabase.from("clan_members").insert({
      clan_id: clan.id,
      user_id: user.id,
      nickname: profile.nickname,
      status: "pending",
    });
    setJoining(false);
    if (error) {
      if (error.code === "23505") toast.error("Ya enviaste una solicitud");
      else toast.error(error.message);
      return;
    }
    toast.success("Solicitud enviada al líder del clan");
    fetchClan();
  };

  const updateMemberStatus = async (memberId: string, status: string) => {
    const { error } = await supabase.from("clan_members").update({ status }).eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "member" ? "Miembro aceptado" : "Solicitud rechazada");
    fetchClan();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("clan_members").delete().eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    toast.success("Miembro removido");
    fetchClan();
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;
  if (!clan) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground mb-4">Clan no encontrado.</p>
      <Link to="/teams" className="text-primary hover:underline">← Volver a Equipos</Link>
    </div>
  );

  const approvedMembers = members.filter((m) => m.status === "member");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a Equipos
      </Link>

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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Clan creado el {new Date(clan.created_at).toLocaleDateString("es")}.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground flex items-center gap-2">{clan.leader_nickname} <Badge className="bg-primary/20 text-primary text-xs">Líder</Badge></span>
              </div>
              {approvedMembers.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                  <Link to={`/player/${m.nickname}`} className="font-medium text-foreground hover:text-primary">{m.nickname}</Link>
                </div>
              ))}
              {approvedMembers.length > 5 && <p className="text-sm text-muted-foreground text-center">y {approvedMembers.length - 5} más...</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Miembros ({approvedMembers.length + 1})</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-foreground flex items-center gap-2">{clan.leader_nickname} <Badge className="bg-primary/20 text-primary text-xs">Líder</Badge></span>
              </div>
              {approvedMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Link to={`/player/${m.nickname}`} className="font-medium text-foreground hover:text-primary">{m.nickname}</Link>
                  {isLeader && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMember(m.id)} title="Remover">
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {isLeader && pendingMembers.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Solicitudes Pendientes</h3>
                <div className="space-y-2">
                  {pendingMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-foreground">{m.nickname}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateMemberStatus(m.id, "member")}><CheckCircle className="h-4 w-4 text-green-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateMemberStatus(m.id, "rejected")}><XCircle className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
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
