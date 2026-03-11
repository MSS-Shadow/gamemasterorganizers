import { Users, Trophy, Swords, TrendingUp, UserCheck, BarChart3 } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Overview of the platform.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Players" value={124} sub="Registered" />
        <StatCard icon={Users} label="Teams" value={32} sub="Total" />
        <StatCard icon={Trophy} label="Tournaments" value={12} sub="Created" />
        <StatCard icon={Trophy} label="Active Tournaments" value={2} sub="In progress" />
        <StatCard icon={Swords} label="Live Scrims" value={1} sub="Right now" />
        <StatCard icon={TrendingUp} label="Creators" value={5} sub="Approved" />
      </div>
    </div>
  );
}
