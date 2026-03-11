import { useState } from "react";
import { Search, Download, CheckCircle, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { mockPlayers, type MockPlayer } from "@/lib/mockAdminData";
import { exportToCsv } from "@/lib/exportCsv";

export default function AdminPlayers() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<MockPlayer[]>(mockPlayers);

  const filtered = players.filter(
    (p) =>
      p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      p.playerId.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCsv("players", ["Nickname", "Player ID", "Platform", "Team", "Country", "Email", "Role", "Verified"], 
      filtered.map((p) => [p.nickname, p.playerId, p.platform, p.team, p.country, p.email, p.role, p.verified ? "Yes" : "No"])
    );
  };

  const toggleVerify = (id: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p)));
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Players</h2>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export to CSV
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search nickname, ID or team..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>Player ID</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden md:table-cell">Team</TableHead>
              <TableHead className="hidden lg:table-cell">Country</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{p.nickname}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{p.playerId}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{p.platform}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.team}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{p.country}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{p.email}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{p.role}</Badge></TableCell>
                <TableCell>
                  {p.verified ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVerify(p.id)} title={p.verified ? "Unverify" : "Verify"}>
                      <CheckCircle className={`h-4 w-4 ${p.verified ? "text-green-400" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePlayer(p.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No players found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
