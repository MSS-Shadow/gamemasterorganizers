import { Star, Trophy } from "lucide-react";

const hallOfFame = [
  { tournament: "BloodStrike Open #3", champion: "Titan Squad", mode: "Squad", date: "Feb 2026" },
  { tournament: "Duo Cup #2", champion: "Nova Duo", mode: "Duo", date: "Jan 2026" },
  { tournament: "Solo Showdown #1", champion: "TitanAlex", mode: "Solo", date: "Jan 2026" },
  { tournament: "BloodStrike Open #2", champion: "Nova Team", mode: "Squad", date: "Dec 2025" },
  { tournament: "BloodStrike Open #1", champion: "Titan Squad", mode: "Squad", date: "Nov 2025" },
  { tournament: "Trio Battle #1", champion: "Kaze Trio", mode: "Trio", date: "Oct 2025" },
  { tournament: "Duo Cup #1", champion: "Titan Pair", mode: "Duo", date: "Sep 2025" },
];

export default function HallOfFamePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hall of Fame</h1>
          <p className="text-muted-foreground">Historic champions of Game Master tournaments.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tournament</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Champion</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Mode</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {hallOfFame.map((h, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{h.tournament}</td>
                <td className="px-4 py-3 text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  {h.champion}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{h.mode}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
