import { Trophy } from "lucide-react";

const categories = ["Solo", "Duo", "Trio", "Squad"];

const rankings: Record<string, { rank: number; name: string; wins: number; champion?: boolean }[]> = {
  Solo: [
    { rank: 1, name: "TitanAlex", wins: 5, champion: true },
    { rank: 2, name: "NovaLeo", wins: 3 },
    { rank: 3, name: "Kaze", wins: 2 },
    { rank: 4, name: "ShadowX", wins: 1 },
    { rank: 5, name: "BlitzK", wins: 1 },
  ],
  Duo: [
    { rank: 1, name: "Nova Duo", wins: 4, champion: true },
    { rank: 2, name: "Titan Pair", wins: 3 },
    { rank: 3, name: "Storm Duo", wins: 1 },
  ],
  Trio: [
    { rank: 1, name: "Kaze Trio", wins: 2, champion: true },
    { rank: 2, name: "Alpha Trio", wins: 1 },
  ],
  Squad: [
    { rank: 1, name: "Titan Squad", wins: 6, champion: true },
    { rank: 2, name: "Nova Team", wins: 4 },
    { rank: 3, name: "Shadow Unit", wins: 2 },
    { rank: 4, name: "Blitz Force", wins: 1 },
  ],
};

export default function RankingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Rankings</h1>
        <p className="text-muted-foreground">Championship rankings by game mode.</p>
      </div>

      <div className="grid gap-6">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xl font-semibold text-foreground mb-3">{cat}</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">#</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings[cat].map((r) => (
                    <tr key={r.rank} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 tabular-nums text-muted-foreground font-medium">{r.rank}</td>
                      <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                        {r.champion && <Trophy className="h-4 w-4 text-primary" />}
                        {r.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{r.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
