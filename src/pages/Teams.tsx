import { useState, useEffect } from "react";
import { Users, Plus, Trophy, Star, UserCheck, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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

export default function TeamsPage() {
  const { user, profile } = useAuth();
  const [clans, setClans] = useState<ClanInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ clan_name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [myClan, setMyClan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener clan del usuario actual
      const { data: profileData } = await supabase
        .from("profiles")
        .select("clan")
        .eq("user_id", user.id)
        .single();

      if (profileData?.clan) setMyClan(profileData.clan);

      // Cargar clanes
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

      // Ordenar: más victorias primero
      clanList.sort((a, b) => b.wins - a.wins || b.memberCount - a.memberCount);
      setClans(clanList);

      // Solicitudes pendientes para el líder actual
      if (profileData?.clan) {
        const { data: requests } = await supabase
          .from("clan_join_requests")
          .select("*")
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
    return <div className="text-center py-20 text-zinc-400">Cargando clanes...</div>;
  }

  const featuredClans = clans.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Equipos / Clanes</h1>
          <p className="text-zinc-400 mt-2">Únete a un clan o crea el tuyo para competir en BloodStrike</p>
        </div>

        {user && (
          <Link 
            to="/clan-leader-request" 
            className="accent-button px-6 py-3 rounded-2xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Solicitar ser Líder
          </Link>
        )}
      </div>

      {/* Notificación de solicitudes pendientes */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex items-center gap-4">
          <Clock className="h-8 w-8 text-amber-400" />
          <div className="flex-1">
            <p className="font-semibold text-white">Tienes {pendingRequests[0].count} solicitud(es) pendiente(s) para unirte a tu clan</p>
            <p className="text-sm text-zinc-400">Revisa las solicitudes en la página de tu clan</p>
          </div>
          <Link 
            to={`/teams/${encodeURIComponent(pendingRequests[0].clan_name)}`}
            className="accent-button px-6 py-2.5 rounded-2xl whitespace-nowrap"
          >
            Ver solicitudes
          </Link>
        </div>
      )}

      {/* Clanes Destacados */}
      {featuredClans.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-400" /> Clanes Destacados
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredClans.map((c, i) => (
              <Card key={c.id} className={myClan === c.name ? "border-yellow-400/50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{c.name}</CardTitle>
                    {myClan === c.name && <Badge className="bg-green-500/20 text-green-400">Tu clan</Badge>}
                  </div>
                  <CardDescription>Líder: {c.leader_nickname}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-3xl font-bold text-white">{c.memberCount}</p>
                      <p className="text-xs text-zinc-500">Miembros</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-400">{c.wins}</p>
                      <p className="text-xs text-zinc-500">Victorias</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/teams/${encodeURIComponent(c.name)}`} className="accent-button w-full text-center py-3 rounded-2xl">
                    Ver Clan
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Todos los Clanes */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Todos los Clanes ({clans.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clans.map((c) => (
            <Card key={c.id} className={myClan === c.name ? "ring-2 ring-yellow-400/30" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{c.name}</CardTitle>
                  {myClan === c.name && <UserCheck className="h-5 w-5 text-green-400" />}
                </div>
                <CardDescription>Líder: {c.leader_nickname}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="h-4 w-4" />
                    {c.memberCount} miembros
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-yellow-400">{c.wins}</span>
                    <span className="text-xs text-zinc-500"> victorias</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  to={`/teams/${encodeURIComponent(c.name)}`}
                  className="w-full text-center py-3 border border-zinc-700 hover:bg-zinc-800 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  Ver Clan <ArrowRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {clans.length === 0 && (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-3xl">
          <Users className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
          <p className="text-xl text-white mb-2">Aún no hay clanes registrados</p>
          <p className="text-zinc-500">Sé el primero en solicitar ser líder</p>
        </div>
      )}
    </div>
  );
}
