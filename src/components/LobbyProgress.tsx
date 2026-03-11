interface LobbyProgressProps {
  current: number;
  max: number;
  label: string;
}

export default function LobbyProgress({ current, max, label }: LobbyProgressProps) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {current} / {max} teams
        </span>
      </div>
      <div className="h-3 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
