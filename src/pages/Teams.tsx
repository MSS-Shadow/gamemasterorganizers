import { useState, useEffect } from "react";
import { Users, Plus, Trophy, Star, UserCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ClanInfo {
  id: string;
  name: string;
  leader_nickname: string;
  memberCount: number;
  wins: number;
}

interface PendingRequest {
  clan_name: string;
  count: number;
}

export default function TeamsPage() {
  const { user, profile } = useAuth();
  const [clans, setClans] = useState<ClanInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [myClan, setMyClan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener perfil del usuario actual
      const { data: profileData } = await supabase
        .from("profiles")
        .select("clan")
        .eq("user_id", user.id)
        .single();

      if (profileData?.clan) setMyClan(profileData.clan);

      // Cargar clanes principales
      const [clansRes, membersRes, championsRes] = await Promise.all([
        supabase.from("clans").select("*"),
        supabase.from("clan_members").select("clan_id").eq("status", "member"),
        supabase.from("tournament_champions").select("team_name"),
      ]);

      const memberCounts = new Map<string, number>();
      membersRes.data?.forEach((m: any) => {
        memberCounts.set(m.clan_id, (memberCounts.get(m.clan_id) || 0) + 1);
      });

      const winCounts = new Map<string, number>();
      championsRes.data?.forEach((c: any) => {
        winCounts.set(c.team_name, (winCounts.get(c.team_name) || 0) + 1);
      });

      const clanList: ClanInfo[] = (clansRes.data as any[] ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        leader_nickname: c.leader_nickname,
        memberCount: (memberCounts.get(c.id) || 0) + 1,
        wins: winCounts.get(c.name) || 0,
      }));

      // Ordenar: primero más victorias, luego más miembros
      clanList.sort((a, b) => b.wins - a.wins || b.memberCount - a.memberCount);
      setClans(clanList);

      // Cargar solicitudes pendientes (solo si es líder)
      if (profileData?.clan) {
        const { data: requests } = await supabase
          .from("clan_join_requests")
          .select("clan_name")
          .eq("clan_name", profileData.clan)
          .eq("status", "pending");

        if (requests && requests.length > 0) {
          setPendingRequests([{ clan_name: profileData.clan, count: requests.length }]);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Cargando clanes...</div>;
  }

  const featuredClans = clans.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Equipos / Clanes</h1>
          <p className="text-muted-foreground">Únete a un clan o crea el tuyo para competir en BloodStrike</p>
        </div>

        {user && (
          <Link 
            to="/clan-leader-request" 
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Solicitar ser Líder
          </Link>
        )}
      </div>

      {/* Notificación de solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-foreground">Tienes {pendingRequests[0].count} solicitud(es) pendiente(s)</p>
            <p className="text-sm text-muted-foreground">
              Ve a la página de tu clan para revisarlas
            </p>
          </div>
          <Link 
            to={`/teams/${encodeURIComponent(pendingRequests[0].clan_name)}`}
            className="ml-auto text-amber-500 hover:underline text-sm font-medium"
          >
            Ver solicitudes →
          </Link>
        </div>
      )}

      {/* Clanes Destacados */}
      {featuredClans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Clanes Destacados
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredClans.map((c) => (
              <Link 
                key={c.id} 
                to={`/teams/${encodeURIComponent(c.name)}`}
                className="group bg-card border-2 border-primary/30 hover:border-primary rounded-xl p-6 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">Líder: {c.leader_nickname}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/60 rounded-lg p-3 text-center">
                    <p className="font-bold text-foreground text-lg">{c.memberCount}</p>
                    <p className="text-xs text-muted-foreground">Miembros</p>
                  </div>
                  <div className="bg-muted/60 rounded-lg p-3 text-center">
                    <p className="font-bold text-foreground text-lg">{c.wins}</p>
                    <p className="text-xs text-muted-foreground">Victorias</p>
                  </div>
                </div>

                {myClan === c.name && (
                  <Badge className="mt-4 w-full justify-center bg-green-500/20 text-green-400 border-green-500/30">
                    <UserCheck className="h-3 w-3 mr-1" /> Tu clan
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Todos los Clanes */}
      {clans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Todos los Clanes ({clans.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {clans.map((c) => (
              <Link 
                key={c.id} 
                to={`/teams/${encodeURIComponent(c.name)}`}
                className={`bg-card border border-border rounded-xl p-5 hover:border-primary/60 transition-all flex flex-col ${myClan === c.name ? 'ring-2 ring-green-500/50' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">Líder: {c.leader_nickname}</p>
                  </div>
                  {myClan === c.name && (
                    <Badge variant="secondary">Tu clan</Badge>
                  )}
                </div>

                <div className="mt-auto flex justify-between items-end text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {c.memberCount} miembros
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-foreground">{c.wins}</span>
                    <span className="text-xs text-muted-foreground"> victorias</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {clans.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">Aún no hay clanes registrados</p>
          <p className="text-muted-foreground mt-2">Sé el primero en solicitar ser líder</p>
        </div>
      )}
    </div>
  );
}
