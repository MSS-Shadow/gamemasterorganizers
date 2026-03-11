import { CalendarDays } from "lucide-react";
import LobbyProgress from "@/components/LobbyProgress";

const upcoming = [
  { name: "BloodStrike Open #4", mode: "Squad", date: "Mar 22, 2026", teams: 42, max: 60 },
  { name: "Duo Cup #3", mode: "Duo", date: "Mar 29, 2026", teams: 18, max: 30 },
  { name: "Solo Showdown #2", mode: "Solo", date: "Apr 5, 2026", teams: 55, max: 120 },
];

export default function UpcomingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Upcoming Tournaments</h1>
        <p className="text-muted-foreground">Events you can register for right now.</p>
      </div>

      <div className="space-y-4">
        {upcoming.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.mode} · {t.date}</p>
              </div>
            </div>
            <LobbyProgress current={t.teams} max={t.max} label="Lobby 1" />
            <button className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
              Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
