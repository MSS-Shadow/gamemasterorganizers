import { Trophy } from "lucide-react";
import LobbyProgress from "@/components/LobbyProgress";

const tournaments = [
  { id: 1, name: "BloodStrike Open #4", mode: "Squad", date: "Mar 22, 2026", status: "Open", teams: 42, max: 60 },
  { id: 2, name: "Duo Cup #3", mode: "Duo", date: "Mar 29, 2026", status: "Open", teams: 18, max: 30 },
  { id: 3, name: "Solo Showdown #2", mode: "Solo", date: "Apr 5, 2026", status: "Open", teams: 55, max: 120 },
  { id: 4, name: "BloodStrike Open #3", mode: "Squad", date: "Feb 15, 2026", status: "Completed", teams: 60, max: 60 },
  { id: 5, name: "Trio Battle #1", mode: "Trio", date: "Feb 1, 2026", status: "Completed", teams: 30, max: 40 },
];

const modes = ["All", "Solo", "Duo", "Trio", "Squad"];

export default function TournamentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Tournaments</h1>
        <p className="text-muted-foreground">Browse and register for upcoming competitions.</p>
      </div>

      {/* Mode Filters */}
      <div className="flex gap-2 flex-wrap">
        {modes.map((m, i) => (
          <button
            key={m}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Tournament List */}
      <div className="space-y-4">
        {tournaments.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.mode} · {t.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    t.status === "Open"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.status}
                </span>
                {t.status === "Open" && (
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
                    Register
                  </button>
                )}
              </div>
            </div>
            <LobbyProgress current={t.teams} max={t.max} label={`Lobby 1`} />
          </div>
        ))}
      </div>
    </div>
  );
}
