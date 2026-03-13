import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";
import TournamentRegisterDialog from "@/components/TournamentRegisterDialog";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<"tournaments">;

export default function UpcomingPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("tournaments").select("*").eq("status", "Open").order("date", { ascending: true });
      if (data) {
        setTournaments(data);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Próximos Torneos</h1>
        <p className="text-muted-foreground">Eventos en los que puedes inscribirte ahora.</p>
      </div>

      <div className="space-y-4">
        {tournaments.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No hay torneos próximos por el momento.</p>
        )}
        {tournaments.map((t) => {
          const count = regCounts[t.id] || 0;
          return (
            <div key={t.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.mode} · {new Date(t.date).toLocaleDateString("es")}</p>
                </div>
              </div>
              <LobbyProgress current={count} max={t.max_players} label="Lobby 1" />
              <button
                onClick={() => setSelectedTournament(t)}
                className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
              >
                Inscribirse
              </button>
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
