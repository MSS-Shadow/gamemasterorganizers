import { Download, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPlayers, mockTournamentRegs, mockScrimParticipants, mockCreatorRequests, mockActivityLog } from "@/lib/mockAdminData";
import { exportToCsv } from "@/lib/exportCsv";

const tables = [
  { name: "Players", count: mockPlayers.length, exportFn: () => exportToCsv("backup_players", ["Nickname","PlayerID","Platform","Team","Country","Email","Role","Verified"], mockPlayers.map(p => [p.nickname,p.playerId,p.platform,p.team,p.country,p.email,p.role,p.verified?"Yes":"No"])) },
  { name: "Tournament Registrations", count: mockTournamentRegs.length, exportFn: () => exportToCsv("backup_tournament_regs", ["Tournament","Team","Nickname","PlayerID","Platform","Date"], mockTournamentRegs.map(r => [r.tournamentName,r.teamName,r.playerNickname,r.playerId,r.platform,r.registrationDate])) },
  { name: "Scrim Participants", count: mockScrimParticipants.length, exportFn: () => exportToCsv("backup_scrim_participants", ["Scrim","Streamer","Nickname","PlayerID","Team","Platform","JoinTime"], mockScrimParticipants.map(s => [s.scrimTitle,s.streamer,s.playerNickname,s.playerId,s.team,s.platform,s.joinTime])) },
  { name: "Content Creators", count: mockCreatorRequests.length, exportFn: () => exportToCsv("backup_creators", ["Nickname","Email","Platform","Channel","Status"], mockCreatorRequests.map(c => [c.nickname,c.email,c.platform,c.channelLink,c.status])) },
  { name: "Activity Log", count: mockActivityLog.length, exportFn: () => exportToCsv("backup_activity_log", ["Action","Detail","Admin","Timestamp"], mockActivityLog.map(l => [l.action,l.detail,l.admin,l.timestamp])) },
];

const exportAllJson = () => {
  const data = { players: mockPlayers, tournamentRegs: mockTournamentRegs, scrimParticipants: mockScrimParticipants, creators: mockCreatorRequests, activityLog: mockActivityLog };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "full_backup.json";
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminBackup() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Backup</h2>
          <p className="text-sm text-muted-foreground">Download backups of all platform data.</p>
        </div>
        <Button onClick={exportAllJson}>
          <Database className="h-4 w-4 mr-1" /> Download Full Backup (JSON)
        </Button>
      </div>

      <div className="grid gap-3">
        {tables.map((t) => (
          <div key={t.name} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{t.name}</span>
              <Badge variant="outline" className="text-xs">{t.count} records</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={t.exportFn}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-2">Automatic Backups</h3>
        <p className="text-sm text-muted-foreground">
          Automatic daily backups will be available once Lovable Cloud is enabled. This will include scheduled snapshots of all tables: Players, Teams, Tournaments, TournamentRegistrations, Scrims, ScrimParticipants, Creators, and HallOfFame.
        </p>
      </div>
    </div>
  );
}
