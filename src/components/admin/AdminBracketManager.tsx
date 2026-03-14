import { useState, useEffect } from "react";
import { Trophy, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  team1_name: string | null;
  team2_name: string | null;
  winner_name: string | null;
  status: string;
}

export default function AdminBracketManager() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("date", { ascending: false }).then(({ data }) => {
      setTournaments(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      supabase.from("bracket_matches").select("*").eq("tournament_id", selectedTournament).order("round").order("match_number").then(({ data }) => {
        setMatches((data as any[]) ?? []);
      });
    }
  }, [selectedTournament]);

  const generateBracket = async () => {
    if (!selectedTournament) return;
    setGenerating(true);

    // Get registered teams
    const { data: regs } = await supabase.from("tournament_registrations").select("tournament_team_name, nickname").eq("tournament_id", selectedTournament);
    if (!regs || regs.length === 0) { toast.error("No hay inscripciones"); setGenerating(false); return; }

    // Get unique teams
    const tournament = tournaments.find((t) => t.id === selectedTournament);
    const isSolo = tournament?.mode === "Solo";
    const teamNames = isSolo
      ? [...new Set(regs.map((r) => r.nickname))]
      : [...new Set(regs.map((r) => r.tournament_team_name))];

    // Calculate bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamNames.length)));
    const totalRounds = Math.log2(bracketSize);

    // Delete existing bracket
    await supabase.from("bracket_matches").delete().eq("tournament_id", selectedTournament);

    // Shuffle teams
    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);

    // Pad with BYEs
    while (shuffled.length < bracketSize) shuffled.push(null as any);

    // Generate round 1 matches
    const newMatches: any[] = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      const team1 = shuffled[i * 2];
      const team2 = shuffled[i * 2 + 1];
      const isBye = !team1 || !team2;
      newMatches.push({
        tournament_id: selectedTournament,
        round: 1,
        match_number: i + 1,
        team1_name: team1 || null,
        team2_name: team2 || null,
        winner_name: isBye ? (team1 || team2 || null) : null,
        status: isBye ? "completed" : "pending",
      });
    }

    // Generate empty subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        newMatches.push({
          tournament_id: selectedTournament,
          round,
          match_number: i + 1,
          team1_name: null,
          team2_name: null,
          winner_name: null,
          status: "pending",
        });
      }
    }

    // Advance BYE winners to round 2
    const round1 = newMatches.filter((m) => m.round === 1);
    const round2 = newMatches.filter((m) => m.round === 2);
    round1.forEach((m, idx) => {
      if (m.winner_name) {
        const r2Match = round2[Math.floor(idx / 2)];
        if (r2Match) {
          if (idx % 2 === 0) r2Match.team1_name = m.winner_name;
          else r2Match.team2_name = m.winner_name;
        }
      }
    });

    const { error } = await supabase.from("bracket_matches").insert(newMatches);
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Bracket generado: ${teamNames.length} equipos, ${totalRounds} rondas`);

    // Refresh matches
    const { data: updated } = await supabase.from("bracket_matches").select("*").eq("tournament_id", selectedTournament).order("round").order("match_number");
    setMatches((updated as any[]) ?? []);
  };

  const setWinner = async (match: Match, winnerName: string) => {
    // Update match winner
    const { error } = await supabase.from("bracket_matches").update({
      winner_name: winnerName,
      status: "completed",
    }).eq("id", match.id);
    if (error) { toast.error(error.message); return; }

    // Advance winner to next round
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.match_number / 2);
    const isTeam1 = match.match_number % 2 === 1;

    const { data: nextMatch } = await supabase.from("bracket_matches").select("*").eq("tournament_id", match.tournament_id).eq("round", nextRound).eq("match_number", nextMatchNumber).single();

    if (nextMatch) {
      const updateData = isTeam1 ? { team1_name: winnerName } : { team2_name: winnerName };
      await supabase.from("bracket_matches").update(updateData).eq("id", (nextMatch as any).id);
    } else {
      // This was the final - record champion
      const tournament = tournaments.find((t) => t.id === match.tournament_id);
      if (tournament) {
        await supabase.from("tournament_champions").insert({
          tournament_id: tournament.id,
          team_name: winnerName,
          mode: tournament.mode,
          tournament_name: tournament.name,
          date: tournament.date,
        });
        // Update tournament status
        await supabase.from("tournaments").update({ status: "Finished" }).eq("id", tournament.id);
        toast.success(`¡${winnerName} es el campeón del torneo!`);
      }
    }

    toast.success(`${winnerName} avanza`);
    // Refresh
    const { data: updated } = await supabase.from("bracket_matches").select("*").eq("tournament_id", selectedTournament).order("round").order("match_number");
    setMatches((updated as any[]) ?? []);
  };

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds, 0);
  const roundName = (round: number) => {
    const diff = maxRound - round;
    if (diff === 0) return "Final";
    if (diff === 1) return "Semifinal";
    if (diff === 2) return "Cuartos de Final";
    return `Ronda ${round}`;
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Gestión de Brackets</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger className="w-full sm:w-[300px]"><SelectValue placeholder="Seleccionar Torneo" /></SelectTrigger>
          <SelectContent>
            {tournaments.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name} ({t.mode})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTournament && (
          <Button onClick={generateBracket} disabled={generating}>
            <Plus className="h-4 w-4 mr-1" /> {generating ? "Generando..." : "Generar Bracket"}
          </Button>
        )}
      </div>

      {matches.length > 0 && (
        <div className="space-y-6">
          {rounds.map((round) => {
            const roundMatches = matches.filter((m) => m.round === round);
            return (
              <div key={round}>
                <h3 className="text-sm font-semibold text-primary mb-3">{roundName(round)}</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {roundMatches.map((m) => (
                    <div key={m.id} className="border border-border rounded-lg overflow-hidden bg-card">
                      <div className="px-3 py-1.5 bg-muted/50 text-xs text-muted-foreground font-medium">Match {m.match_number}</div>
                      <div className={`px-3 py-2 flex items-center justify-between text-sm border-b border-border ${m.winner_name === m.team1_name && m.winner_name ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}>
                        <span className="truncate">{m.team1_name || "—"}</span>
                        {m.status === "pending" && m.team1_name && m.team2_name && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setWinner(m, m.team1_name!)} title="Seleccionar ganador">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className={`px-3 py-2 flex items-center justify-between text-sm ${m.winner_name === m.team2_name && m.winner_name ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}>
                        <span className="truncate">{m.team2_name || "—"}</span>
                        {m.status === "pending" && m.team1_name && m.team2_name && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setWinner(m, m.team2_name!)} title="Seleccionar ganador">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTournament && matches.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No hay bracket generado para este torneo. Haz clic en "Generar Bracket" para crear uno.</p>
      )}
    </div>
  );
}
