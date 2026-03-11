import { Trophy, CalendarDays, Swords, Megaphone, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import LobbyProgress from "@/components/LobbyProgress";

const upcomingTournaments = [
  { id: 1, name: "BloodStrike Open #4", mode: "Squad", date: "Mar 22, 2026", teams: 42, max: 60 },
  { id: 2, name: "Duo Cup #3", mode: "Duo", date: "Mar 29, 2026", teams: 18, max: 30 },
  { id: 3, name: "Solo Showdown #2", mode: "Solo", date: "Apr 5, 2026", teams: 55, max: 120 },
];

const announcements = [
  { id: 1, text: "Registration for BloodStrike Open #4 is now open!", date: "Mar 10, 2026" },
  { id: 2, text: "New ranking system coming soon — stay tuned.", date: "Mar 8, 2026" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-lg overflow-hidden bg-card border border-border p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Game Master Organizers
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground text-balance mb-4">
            BloodStrike Open #4.{" "}
            <span className="text-primary">Register Now.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mb-6">
            The competitive home for BloodStrike. Tournaments, scrims, rankings — all in one place.
          </p>
          <Link
            to="/tournaments"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
          >
            View Tournaments
          </Link>
        </div>
      </div>

      {/* Current Champion */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Current Champion</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Titan Squad</p>
            <p className="text-sm text-muted-foreground">BloodStrike Open #3</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Tournaments" value={12} sub="Completed" />
        <StatCard icon={Swords} label="Scrims" value={48} sub="This month" />
        <StatCard icon={CalendarDays} label="Upcoming" value={3} sub="Events" />
        <StatCard icon={Megaphone} label="Players" value={320} sub="Registered" />
      </div>

      {/* Upcoming Tournaments */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Tournaments</h2>
        <div className="space-y-4">
          {upcomingTournaments.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.mode} · {t.date}
                  </p>
                </div>
                <Link
                  to="/tournaments"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all self-start"
                >
                  Register
                </Link>
              </div>
              <LobbyProgress current={t.teams} max={t.max} label="Lobby 1" />
            </div>
          ))}
        </div>
      </section>

      {/* Active Scrims */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Active Scrims</h2>
          <Link to="/scrims" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {[
            { name: "Night Scrim #12", streamer: "TitanAlex", mode: "Squad", players: 38 },
            { name: "Duo Practice", streamer: "NovaLeo", mode: "Duo", players: 14 },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  by {s.streamer} · {s.mode} · {s.players} players
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">
                LIVE
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Announcements</h2>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
              <Megaphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground">{a.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
