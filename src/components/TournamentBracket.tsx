import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface BracketMatch {
  id: string;
  round: number;
  match_number: number;
  team1_name: string | null;
  team2_name: string | null;
  winner_name: string | null;
  status: string;
}

interface Props {
  tournamentId: string;
}

export default function TournamentBracket({ tournamentId }: Props) {
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("bracket_matches").select("*").eq("tournament_id", tournamentId).order("round").order("match_number");
      setMatches((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [tournamentId]);

  if (loading) return null;
  if (matches.length === 0) return null;

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);

  const roundName = (round: number) => {
    const diff = maxRound - round;
    if (diff === 0) return "Final";
    if (diff === 1) return "Semifinal";
    if (diff === 2) return "Cuartos de Final";
    return `Ronda ${round}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" /> Bracket del Torneo
      </h2>
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {rounds.map((round) => {
            const roundMatches = matches.filter((m) => m.round === round);
            return (
              <div key={round} className="flex flex-col gap-4 min-w-[200px]">
                <h3 className="text-sm font-semibold text-primary text-center">{roundName(round)}</h3>
                <div className="flex flex-col justify-around flex-1 gap-4">
                  {roundMatches.map((m) => (
                    <div key={m.id} className="border border-border rounded-lg overflow-hidden">
                      <div className={`px-3 py-2 text-sm flex items-center justify-between ${
                        m.winner_name === m.team1_name && m.winner_name ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                      } border-b border-border`}>
                        <span className="truncate">{m.team1_name || "BYE"}</span>
                        {m.winner_name === m.team1_name && m.winner_name && <Trophy className="h-3 w-3 text-primary shrink-0" />}
                      </div>
                      <div className={`px-3 py-2 text-sm flex items-center justify-between ${
                        m.winner_name === m.team2_name && m.winner_name ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                      }`}>
                        <span className="truncate">{m.team2_name || "BYE"}</span>
                        {m.winner_name === m.team2_name && m.winner_name && <Trophy className="h-3 w-3 text-primary shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
