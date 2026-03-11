import { Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const teams = [
  { name: "Titan Squad", players: ["TitanAlex", "TitanMax", "TitanKai", "TitanZoe"], tournaments: 8, championships: 3 },
  { name: "Nova Team", players: ["NovaLeo", "NovaRay", "NovaMia", "NovaJin"], tournaments: 6, championships: 2 },
  { name: "Shadow Unit", players: ["ShadowX", "ShadowK", "ShadowV", "ShadowQ"], tournaments: 5, championships: 1 },
  { name: "Blitz Force", players: ["BlitzK", "BlitzR", "BlitzT", "BlitzM"], tournaments: 4, championships: 0 },
  { name: "Storm Squad", players: ["StormA", "StormB", "StormC", "StormD"], tournaments: 3, championships: 0 },
];

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Teams</h1>
        <p className="text-muted-foreground">Registered teams and their competitive history.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {teams.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ y: -4 }}
            transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.players.length} players</p>
              </div>
              {t.championships > 0 && (
                <div className="ml-auto flex items-center gap-1 text-primary">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-bold tabular-nums">{t.championships}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {t.players.map((p) => (
                <span key={p} className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground">{p}</span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t.tournaments} tournaments played</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
