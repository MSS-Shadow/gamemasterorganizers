import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";
import TournamentBracket from "@/components/TournamentBracket";
import TournamentRegisterDialog from "@/components/TournamentRegisterDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TournamentDetail() {
  const { tournamentName } = useParams<{ tournamentName: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [regCount, setRegCount] = useState(0);
  const [regs, setRegs] = useState<any[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!tournamentName) return;
      const decoded = decodeURIComponent(tournamentName).replace(/-/g, " ");
      const { data } = await supabase.from("tournaments").select("*");
      const match = data?.find((t: any) => t.name.toLowerCase() === decoded.toLowerCase() || t.id === tournamentName);
      if (match) {
        setTournament(match);
        const { data: regData } = await supabase.from("tournament_registrations").select("*").eq("tournament_id", match.id);
        setRegs(regData ?? []);
        setRegCount(regData?.length ?? 0);
      }
      setLoading(false);
    };
    fetch();
  }, [tournamentName, showRegister]);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;
  if (!tournament) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground mb-4">Torneo no encontrado.</p>
      <Link to="/tournaments" className="text-primary hover:underline">← Volver a Torneos</Link>
    </div>
  );

  const statusLabel: Record<string, string> = {
    Open: "Abierto",
    Closed: "Cerrado",
    "In Progress": "En Progreso",
    Finished: "Finalizado",
  };

  // Group registrations by team
  const teamMap = new Map<string, any[]>();
  regs.forEach((r) => {
    const key = r.tournament_team_name || r.nickname;
    if (!teamMap.has(key)) teamMap.set(key, []);
    teamMap.get(key)!.push(r);
  });

  return (
    <div className="space-y-6">
      <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a Torneos
      </Link>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
              <p className="text-sm text-muted-foreground">{tournament.mode} · {new Date(tournament.date).toLocaleDateString("es")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={tournament.status === "Open" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
              {statusLabel[tournament.status] || tournament.status}
            </Badge>
            {tournament.status === "Open" && (
              <Button onClick={() => setShowRegister(true)}>Inscribirse</Button>
            )}
          </div>
        </div>
        <LobbyProgress current={regCount} max={tournament.max_players} label="Lobby 1" />
      </div>

      {/* Registered Teams/Players */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Jugadores Inscritos ({regCount})</h2>
        {teamMap.size > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {Array.from(teamMap.entries()).map(([team, players]) => (
              <div key={team} className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground text-sm mb-1">{team}</p>
                <div className="flex flex-wrap gap-1">
                  {players.map((p) => (
                    <Link key={p.id} to={`/player/${p.nickname}`} className="text-xs text-muted-foreground hover:text-primary">{p.nickname}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aún no hay inscripciones.</p>
        )}
      </div>

      {/* Tournament Bracket */}
      <TournamentBracket tournamentId={tournament.id} />

      {showRegister && (
        <TournamentRegisterDialog
          open={showRegister}
          onClose={() => setShowRegister(false)}
          tournament={{ id: tournament.id, name: tournament.name, mode: tournament.mode }}
        />
      )}
    </div>
  );
}
