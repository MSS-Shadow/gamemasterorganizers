import { TrendingUp } from "lucide-react";

const activityData = [
  { rank: 1, name: "TitanAlex", tournaments: 18, scrims: 32 },
  { rank: 2, name: "NovaLeo", tournaments: 16, scrims: 28 },
  { rank: 3, name: "Kaze", tournaments: 14, scrims: 25 },
  { rank: 4, name: "ShadowX", tournaments: 10, scrims: 20 },
  { rank: 5, name: "BlitzK", tournaments: 8, scrims: 18 },
  { rank: 6, name: "StormA", tournaments: 5, scrims: 12 },
  { rank: 7, name: "StreamerJin", tournaments: 4, scrims: 15 },
  { rank: 8, name: "RookieV", tournaments: 3, scrims: 8 },
];

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Leaderboard</h1>
          <p className="text-muted-foreground">Most active players by participation.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-16">#</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Player</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Tournaments</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Scrims</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((p) => (
              <tr key={p.rank} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3 tabular-nums text-muted-foreground font-bold">{p.rank}</td>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{p.tournaments}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{p.scrims}</td>
                <td className="px-4 py-3 tabular-nums text-foreground font-semibold text-right">{p.tournaments + p.scrims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
