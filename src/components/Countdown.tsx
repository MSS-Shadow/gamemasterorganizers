import { useEffect, useState } from "react";

function diffParts(targetMs: number) {
  const now = Date.now();
  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

export default function Countdown({ target, className }: { target: string | Date; className?: string }) {
  const targetMs = typeof target === "string" ? new Date(target).getTime() : target.getTime();
  const [parts, setParts] = useState(() => diffParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (parts.done) return <span className={className}>¡Empezó!</span>;
  const label =
    parts.d > 0
      ? `Faltan ${parts.d}d ${parts.h}h ${parts.m}m`
      : parts.h > 0
      ? `Faltan ${parts.h}h ${parts.m}m ${parts.s}s`
      : `Faltan ${parts.m}m ${parts.s}s`;
  return <span className={className}>{label}</span>;
}