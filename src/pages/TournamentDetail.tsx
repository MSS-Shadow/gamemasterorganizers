import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, ArrowLeft, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";
import TournamentBracket from "@/components/TournamentBracket";
import TournamentRegisterDialog from "@/components/TournamentRegisterDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function TournamentDetail() {
  const { tournamentName } = useParams<{ tournamentName: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [regCount, setRegCount] = useState(0);
  const [regs, setRegs] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
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
        const [regRes, resultsRes] = await Promise.all([
          supabase.from("tournament_registrations").select("*").eq("tournament_id", match.id),
          supabase.from("tournament_results").select("*").eq("tournament_id", match.id).order("total_points", { ascending: false }),
        ]);
        setRegs(regRes.data ?? []);
        setRegCount(regRes.data?.length ?? 0);
        setResults((resultsRes.data as any[]) ?? []);
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
    Open: "Abierto", Closed: "Cerrado", "In Progress": "En Progreso", Finished: "Finalizado",
  };

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

      {/* Tournament Results */}
      {results.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" /> Resultados del Torneo
          </h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead className="text-right">Kills</TableHead>
                  <TableHead className="text-right">Pts Kill</TableHead>
                  <TableHead className="text-right">Pts Posición</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r: any, i: number) => (
                  <TableRow key={r.id} className={i === 0 ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-foreground flex items-center gap-2">
                      {i === 0 && <Trophy className="h-4 w-4 text-primary" />}
                      {r.team_name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{r.kills}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.kill_points).toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.position_points).toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.multiplier_bonus).toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-foreground">{Number(r.total_points).toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

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
