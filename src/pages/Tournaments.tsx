import { useState, useEffect } from "react";
import { Trophy, Filter, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LobbyProgress from "@/components/LobbyProgress";
import TournamentRegisterDialog from "@/components/TournamentRegisterDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<"tournaments">;

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  const [filterMode, setFilterMode] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterRegion, setFilterRegion] = useState("Todos");

  const modes = ["Todos", "Solo", "Duo", "Trio", "Squad"];
  const statuses = ["Todos", "Open", "Closed", "In Progress", "Finished"];
  const regions = ["Todos", "LATAM", "BR"];

  const statusLabel: Record<string, string> = {
    Open: "Abierto",
    Closed: "Cerrado",
    "In Progress": "En Progreso",
    Finished: "Finalizado"
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: tourData } = await supabase
        .from("tournaments")
        .select("*")
        .order("date", { ascending: false });

      if (tourData) {
        setTournaments(tourData);

        const { data: regs } = await supabase
          .from("tournament_registrations")
          .select("tournament_id");

        if (regs) {
          const counts: Record<string, number> = {};
          regs.forEach((r: any) => {
            counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1;
          });
          setRegCounts(counts);
        }
      }
    };

    fetchData();
  }, []);

  // Filtros
  let filteredTournaments = tournaments;

  if (filterMode !== "Todos") {
    filteredTournaments = filteredTournaments.filter(t => t.mode === filterMode);
  }
  if (filterStatus !== "Todos") {
    filteredTournaments = filteredTournaments.filter(t => t.status === filterStatus);
  }
  if (filterRegion !== "Todos") {
    filteredTournaments = filteredTournaments.filter((t: any) => t.region === filterRegion);
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Torneos</h1>
          <p className="text-zinc-400 mt-2">Compite, mejora y demuestra tu nivel en BloodStrike</p>
        </div>
        <Link
          to="/tournaments"
          className="accent-button px-6 py-3 rounded-2xl flex items-center gap-2 self-start"
        >
          <Trophy className="h-5 w-5" />
          Crear Torneo (Admin)
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                filterMode === mode 
                  ? "bg-yellow-400 text-zinc-950 shadow" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status 
                  ? "bg-yellow-400 text-zinc-950" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {statusLabel[status] || status}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Torneos */}
      <div className="space-y-6">
        {filteredTournaments.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <Trophy className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">No hay torneos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTournaments.map((t) => {
              const count = regCounts[t.id] || 0;
              const isOpen = t.status === "Open";

              return (
                <Card key={t.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-400/10 rounded-2xl">
                          <Trophy className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                          <CardTitle>{t.name}</CardTitle>
                          <CardDescription>
                            {t.mode} • {(t as any).region || "LATAM"} • {new Date(t.date).toLocaleDateString("es", {
                              weekday: "long",
                              month: "long",
                              day: "numeric"
                            })}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                          isOpen 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {statusLabel[t.status] || t.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <LobbyProgress 
                      current={count} 
                      max={t.max_players} 
                      label={`Inscripciones (${count}/${t.max_players})`} 
                    />
                  </CardContent>

                  <CardFooter>
                    {isOpen ? (
                      <button
                        onClick={() => setSelectedTournament(t)}
                        className="accent-button w-full py-4 rounded-2xl text-lg font-semibold"
                      >
                        Inscribirse ahora
                      </button>
                    ) : (
                      <div className="w-full text-center py-4 text-zinc-500 text-sm">
                        Inscripciones {t.status === "Closed" ? "cerradas" : "finalizadas"}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Diálogo de inscripción */}
      {selectedTournament && (
        <TournamentRegisterDialog
          open={!!selectedTournament}
          onClose={() => setSelectedTournament(null)}
          tournament={{
            id: selectedTournament.id,
            name: selectedTournament.name,
            mode: selectedTournament.mode
          }}
        />
      )}
    </div>
  );
}
