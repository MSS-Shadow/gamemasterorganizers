import { User, ShieldCheck } from "lucide-react";

const players = [
  { nickname: "TitanAlex", playerId: "BS-001234", platform: "PC", team: "Titan Squad", tournaments: 18, bestPos: "1st", verified: true },
  { nickname: "NovaLeo", playerId: "BS-005678", platform: "Mobile", team: "Nova Team", tournaments: 16, bestPos: "1st", verified: true },
  { nickname: "Kaze", playerId: "BS-009012", platform: "PC", team: null, tournaments: 14, bestPos: "2nd", verified: true },
  { nickname: "ShadowX", playerId: "BS-003456", platform: "PC", team: "Shadow Unit", tournaments: 10, bestPos: "3rd", verified: false },
  { nickname: "BlitzK", playerId: "BS-007890", platform: "Mobile", team: "Blitz Force", tournaments: 8, bestPos: "5th", verified: false },
  { nickname: "StormA", playerId: "BS-002345", platform: "PC", team: "Storm Squad", tournaments: 5, bestPos: "8th", verified: false },
];

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Players</h1>
        <p className="text-muted-foreground">All registered players in the community.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              {["Player", "Player ID", "Platform", "Team", "Tournaments", "Best", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.playerId} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {p.nickname}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{p.playerId}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{p.platform}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.team || "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{p.tournaments}</td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">{p.bestPos}</td>
                <td className="px-4 py-3">
                  {p.verified ? (
                    <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
