import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTournamentRegs, mockTournaments } from "@/lib/mockAdminData";
import { exportToCsv } from "@/lib/exportCsv";

export default function AdminTournamentRegistrations() {
  const [selectedTournament, setSelectedTournament] = useState("all");

  const filtered = selectedTournament === "all"
    ? mockTournamentRegs
    : mockTournamentRegs.filter((r) => r.tournamentName === selectedTournament);

  const handleExport = () => {
    exportToCsv("tournament_registrations", ["Tournament", "Team", "Nickname", "Player ID", "Platform", "Date"],
      filtered.map((r) => [r.tournamentName, r.teamName, r.playerNickname, r.playerId, r.platform, r.registrationDate])
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Tournament Registrations</h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export to CSV
        </Button>
      </div>
      <Select value={selectedTournament} onValueChange={setSelectedTournament}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Filter by tournament" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tournaments</SelectItem>
          {mockTournaments.map((t) => (
            <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tournament</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead className="hidden md:table-cell">Player ID</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-foreground font-medium">{r.tournamentName}</TableCell>
                <TableCell className="text-muted-foreground">{r.teamName}</TableCell>
                <TableCell className="text-foreground">{r.playerNickname}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">{r.playerId}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{r.platform}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{r.registrationDate}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No registrations found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
