import { Medal, Trophy } from "lucide-react";

const results = [
  {
    tournament: "BloodStrike Open #3",
    mode: "Squad",
    date: "Feb 15, 2026",
    standings: [
      { pos: 1, name: "Titan Squad" },
      { pos: 2, name: "Nova Team" },
      { pos: 3, name: "Shadow Unit" },
    ],
  },
  {
    tournament: "Duo Cup #2",
    mode: "Duo",
    date: "Jan 28, 2026",
    standings: [
      { pos: 1, name: "Nova Duo" },
      { pos: 2, name: "Titan Pair" },
      { pos: 3, name: "Storm Duo" },
    ],
  },
  {
    tournament: "Solo Showdown #1",
    mode: "Solo",
    date: "Jan 10, 2026",
    standings: [
      { pos: 1, name: "TitanAlex" },
      { pos: 2, name: "Kaze" },
      { pos: 3, name: "NovaLeo" },
    ],
  },
];

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Results</h1>
        <p className="text-muted-foreground">Final standings from completed tournaments.</p>
      </div>

      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <Medal className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{r.tournament}</h3>
                <p className="text-sm text-muted-foreground">{r.mode} · {r.date}</p>
              </div>
            </div>
            <div className="space-y-2">
              {r.standings.map((s) => (
                <div key={s.pos} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-foreground/5 transition-colors">
                  <span className={`w-6 text-center tabular-nums font-bold ${s.pos === 1 ? "text-primary" : "text-muted-foreground"}`}>
                    {s.pos}
                  </span>
                  {s.pos === 1 && <Trophy className="h-4 w-4 text-primary" />}
                  <span className={`font-medium ${s.pos === 1 ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
