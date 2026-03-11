import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
      className="bg-card rounded-lg p-5 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}
