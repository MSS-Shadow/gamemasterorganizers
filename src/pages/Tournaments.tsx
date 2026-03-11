import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";
import TournamentRegisterDialog from "@/components/TournamentRegisterDialog";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<"tournaments">;

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filterMode, setFilterMode] = useState("All");

  const modes = ["All", "Solo", "Duo", "Trio", "Squad"];

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("tournaments").select("*").order("date", { ascending: false });
      if (data) {
        setTournaments(data);
        // Fetch registration counts
        const { data: regs } = await supabase.from("tournament_registrations").select("tournament_id");
        if (regs) {
          const counts: Record<string, number> = {};
          regs.forEach((r) => { counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1; });
          setRegCounts(counts);
        }
      }
    };
    fetch();
  }, [selectedTournament]);

  const filtered = filterMode === "All" ? tournaments : tournaments.filter((t) => t.mode === filterMode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Tournaments</h1>
        <p className="text-muted-foreground">Browse and register for upcoming competitions.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterMode === m
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No hay torneos disponibles.</p>
        )}
        {filtered.map((t) => {
          const count = regCounts[t.id] || 0;
          return (
            <div key={t.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.mode} · {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                    t.status === "Open" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {t.status}
                  </span>
                  {t.status === "Open" && (
                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
              <LobbyProgress current={count} max={t.max_players} label="Lobby 1" />
            </div>
          );
        })}
      </div>

      {selectedTournament && (
        <TournamentRegisterDialog
          open={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
          tournament={{ id: selectedTournament.id, name: selectedTournament.name, mode: selectedTournament.mode }}
        />
      )}
    </div>
  );
}
