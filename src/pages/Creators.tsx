import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const creators = [
  { name: "TitanAlex", platform: "YouTube", link: "#", viewers: 350 },
  { name: "NovaLeo", platform: "Twitch", link: "#", viewers: 220 },
  { name: "Kaze", platform: "YouTube", link: "#", viewers: 180 },
  { name: "StreamerJin", platform: "Twitch", link: "#", viewers: 90 },
];

export default function CreatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Creators Hub</h1>
        <p className="text-muted-foreground">Content creators in the BloodStrike community.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {creators.map((c) => (
          <motion.div
            key={c.name}
            whileHover={{ y: -4 }}
            transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h3 className="font-semibold text-foreground mb-1">{c.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {c.platform} · ~{c.viewers} avg viewers
            </p>
            <a
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Visit Channel
            </a>
          </motion.div>
        ))}
      </div>

      {/* Request Creator Access */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Become a Creator</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Request content creator access to organize scrims and get featured.
        </p>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 active:scale-95 transition-all">
          Request Access
        </button>
      </div>
    </div>
  );
}
