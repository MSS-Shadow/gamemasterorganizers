import { Swords, ExternalLink } from "lucide-react";

const liveScrims = [
  { title: "Night Scrim #12", streamer: "TitanAlex", mode: "Squad", date: "Mar 11, 2026", time: "9:00 PM", players: 38, streamLink: "#" },
];

const upcomingScrims = [
  { title: "Morning Practice", streamer: "NovaLeo", mode: "Duo", date: "Mar 12, 2026", time: "10:00 AM", players: 0, streamLink: "#" },
  { title: "Trio Warmup", streamer: "Kaze", mode: "Trio", date: "Mar 13, 2026", time: "8:00 PM", players: 0, streamLink: "#" },
];

const scrimHistory = [
  { title: "Night Scrim #11", streamer: "TitanAlex", mode: "Squad", date: "Mar 9, 2026", players: 48 },
  { title: "Duo Practice #5", streamer: "NovaLeo", mode: "Duo", date: "Mar 7, 2026", players: 22 },
];

function ScrimCard({ scrim, live }: { scrim: typeof liveScrims[0]; live?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Swords className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{scrim.title}</h3>
            <p className="text-sm text-muted-foreground">by {scrim.streamer} · {scrim.mode}</p>
          </div>
        </div>
        {live && (
          <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">LIVE</span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{scrim.date} · {scrim.time}</span>
        <div className="flex items-center gap-3">
          <span className="tabular-nums">{scrim.players} players</span>
          {"streamLink" in scrim && (
            <a href="#" className="text-accent hover:underline inline-flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> Watch
            </a>
          )}
        </div>
      </div>
      {!live && scrim.players === 0 && (
        <button className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
          Join Scrim
        </button>
      )}
    </div>
  );
}

export default function ScrimsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Scrims</h1>
        <p className="text-muted-foreground">Practice matches organized by creators and admins.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Live Scrims</h2>
        {liveScrims.length > 0 ? (
          <div className="space-y-3">{liveScrims.map((s, i) => <ScrimCard key={i} scrim={s} live />)}</div>
        ) : (
          <p className="text-muted-foreground text-sm">No live scrims right now.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Upcoming Scrims</h2>
        <div className="space-y-3">{upcomingScrims.map((s, i) => <ScrimCard key={i} scrim={s} />)}</div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Scrim History</h2>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {scrimHistory.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground">by {s.streamer} · {s.mode}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{s.date}</p>
                <p className="tabular-nums">{s.players} players</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
