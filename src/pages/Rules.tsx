export default function RulesPage() {
  const rules = [
    {
      title: "General Rules",
      items: [
        "All players must register with valid BloodStrike Player IDs.",
        "One account per player. Duplicate accounts will be flagged and may be banned.",
        "Respectful behavior is expected at all times. Toxic behavior will result in warnings or bans.",
        "All decisions by Game Master admins are final.",
      ],
    },
    {
      title: "Tournament Rules",
      items: [
        "Teams must be registered at least 24 hours before the tournament starts.",
        "Players must be online 15 minutes before their scheduled match.",
        "No-shows will result in automatic disqualification.",
        "Roster changes are not allowed once the tournament starts.",
        "Match results are determined by in-game placement and kills.",
      ],
    },
    {
      title: "Scrim Rules",
      items: [
        "Scrims are organized by admins and verified content creators only.",
        "Room IDs and passwords are shared only with registered participants.",
        "Stream sniping is strictly prohibited and will result in a ban.",
        "Players must follow the game mode specified by the scrim organizer.",
      ],
    },
    {
      title: "Fair Play",
      items: [
        "Use of cheats, hacks, or exploits is strictly prohibited.",
        "Any player caught cheating will be permanently banned from all Game Master events.",
        "Teaming in solo matches is not allowed.",
        "Players must use the same account registered on the platform.",
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Rules</h1>
        <p className="text-muted-foreground">Official rules for all Game Master events.</p>
      </div>

      {rules.map((section, i) => (
        <section key={i}>
          <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
          <div className="bg-card border border-border rounded-lg p-5">
            <ol className="space-y-3">
              {section.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-sm">
                  <span className="text-primary font-bold tabular-nums shrink-0">{j + 1}.</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}
