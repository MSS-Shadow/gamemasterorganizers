import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { mockScrimParticipants } from "@/lib/mockAdminData";
import { exportToCsv } from "@/lib/exportCsv";

export default function AdminScrimParticipants() {
  const handleExport = () => {
    exportToCsv("scrim_participants", ["Scrim", "Streamer", "Nickname", "Player ID", "Team", "Platform", "Join Time"],
      mockScrimParticipants.map((s) => [s.scrimTitle, s.streamer, s.playerNickname, s.playerId, s.team, s.platform, s.joinTime])
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Scrim Participants</h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export to CSV
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scrim</TableHead>
              <TableHead className="hidden md:table-cell">Streamer</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead className="hidden md:table-cell">Player ID</TableHead>
              <TableHead className="hidden lg:table-cell">Team</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead>Join Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockScrimParticipants.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-foreground font-medium">{s.scrimTitle}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.streamer}</TableCell>
                <TableCell className="text-foreground">{s.playerNickname}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">{s.playerId}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{s.team}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{s.platform}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-xs">{s.joinTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
