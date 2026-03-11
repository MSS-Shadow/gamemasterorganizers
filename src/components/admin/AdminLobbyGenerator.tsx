import { useState } from "react";
import { Download, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTournaments, mockTournamentRegs } from "@/lib/mockAdminData";
import { exportToCsv } from "@/lib/exportCsv";

const LOBBY_CAPACITY = 120;

interface LobbyTeam {
  teamName: string;
  players: { nickname: string; playerId: string; platform: string }[];
}

interface Lobby {
  number: number;
  teams: LobbyTeam[];
  playerCount: number;
}

export default function AdminLobbyGenerator() {
  const [selectedTournament, setSelectedTournament] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  const selectedT = mockTournaments.find((t) => t.id === selectedTournament);

  const modeMap: Record<string, number> = { Solo: 1, Duo: 2, Trio: 3, Squad: 4 };
  const teamSize = selectedT ? (modeMap[selectedT.mode] ?? 4) : 4;
  const teamsPerLobby = Math.floor(LOBBY_CAPACITY / teamSize);

  const generateLobbies = () => {
    if (!selectedT) return;
    const regs = mockTournamentRegs.filter((r) => r.tournamentName === selectedT.name);

    // Group by team
    const teamMap = new Map<string, { nickname: string; playerId: string; platform: string }[]>();
    regs.forEach((r) => {
      if (!teamMap.has(r.teamName)) teamMap.set(r.teamName, []);
      teamMap.get(r.teamName)!.push({ nickname: r.playerNickname, playerId: r.playerId, platform: r.platform });
    });

    const allTeams: LobbyTeam[] = Array.from(teamMap.entries()).map(([teamName, players]) => ({ teamName, players }));

    const generatedLobbies: Lobby[] = [];
    let lobbyNum = 1;
    for (let i = 0; i < allTeams.length; i += teamsPerLobby) {
      const slice = allTeams.slice(i, i + teamsPerLobby);
      generatedLobbies.push({
        number: lobbyNum++,
        teams: slice,
        playerCount: slice.reduce((sum, t) => sum + t.players.length, 0),
      });
    }

    setLobbies(generatedLobbies);
  };

  const exportLobby = (lobby: Lobby) => {
    const rows: string[][] = [];
    lobby.teams.forEach((t) => {
      t.players.forEach((p) => {
        rows.push([t.teamName, p.nickname, p.playerId, p.platform]);
      });
    });
    exportToCsv(`lobby_${lobby.number}`, ["Team", "Nickname", "Player ID", "Platform"], rows);
  };

  const exportAllLobbies = () => {
    const rows: string[][] = [];
    lobbies.forEach((lobby) => {
      lobby.teams.forEach((t) => {
        t.players.forEach((p) => {
          rows.push([`Lobby ${lobby.number}`, t.teamName, p.nickname, p.playerId, p.platform]);
        });
      });
    });
    exportToCsv("all_lobbies", ["Lobby", "Team", "Nickname", "Player ID", "Platform"], rows);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Generate Lobby List</h2>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select tournament" />
          </SelectTrigger>
          <SelectContent>
            {mockTournaments.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name} ({t.mode})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generateLobbies} disabled={!selectedTournament}>
          <Shuffle className="h-4 w-4 mr-1" /> Generate Lobbies
        </Button>
      </div>

      {selectedT && (
        <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-1">
          <p>Mode: <span className="text-foreground font-medium">{selectedT.mode}</span></p>
          <p>Team size: <span className="text-foreground font-medium">{teamSize}</span></p>
          <p>Teams per lobby: <span className="text-foreground font-medium">{teamsPerLobby}</span></p>
          <p>Max players per lobby: <span className="text-foreground font-medium">{LOBBY_CAPACITY}</span></p>
        </div>
      )}

      {lobbies.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{lobbies.length} lobby(s) generated</p>
            <Button variant="outline" size="sm" onClick={exportAllLobbies}>
              <Download className="h-4 w-4 mr-1" /> Export All Lobbies
            </Button>
          </div>

          <div className="space-y-4">
            {lobbies.map((lobby) => (
              <div key={lobby.number} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30">Lobby {lobby.number}</Badge>
                    <span className="text-sm text-muted-foreground">{lobby.playerCount} players · {lobby.teams.length} teams</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => exportLobby(lobby)}>
                    <Download className="h-4 w-4 mr-1" /> CSV
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  {lobby.teams.map((team) => (
                    <div key={team.teamName}>
                      <p className="text-sm font-semibold text-primary mb-1">Team: {team.teamName}</p>
                      <div className="pl-4 space-y-0.5">
                        {team.players.map((p) => (
                          <p key={p.playerId} className="text-sm text-foreground">
                            {p.nickname} <span className="text-muted-foreground font-mono text-xs">({p.playerId})</span>{" "}
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">{p.platform}</Badge>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
