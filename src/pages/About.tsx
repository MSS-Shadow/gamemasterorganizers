import { BookOpen, Trophy, Users, Swords, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">About Game Master Organizers</h1>
        <p className="text-muted-foreground leading-relaxed">
          Game Master Organizers is the official competitive community hub for BloodStrike. 
          We organize tournaments, scrims, and maintain rankings for the growing competitive scene.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Trophy, title: "Tournaments", desc: "Regular Solo, Duo, Trio, and Squad tournaments with full rankings." },
          { icon: Swords, title: "Scrims", desc: "Practice matches organized by verified creators and admins." },
          { icon: Users, title: "Community", desc: "A growing community of competitive BloodStrike players." },
          { icon: Target, title: "Rankings", desc: "Championship-based ranking system across all game modes." },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">{item.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          To build a competitive platform that gives every BloodStrike player a home — 
          from casual competitors to serious teams. Every match matters. Every player's history counts.
        </p>
      </div>
    </div>
  );
}
