import { useState, useEffect } from "react";
import { Search, Download, CheckCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface PlayerWithRoles extends Profile {
  roles: string[];
}

export default function AdminPlayers() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<PlayerWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allRoles } = await supabase.from("user_roles").select("*");
    if (profiles) {
      const mapped: PlayerWithRoles[] = profiles.map((p) => ({
        ...p,
        roles: allRoles?.filter((r) => r.user_id === p.user_id).map((r) => r.role) ?? [],
      }));
      setPlayers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlayers(); }, []);

  const filtered = players.filter(
    (p) =>
      p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      p.player_id.toLowerCase().includes(search.toLowerCase()) ||
      p.clan.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCsv("players", ["Nickname", "Player ID", "Platform", "Clan", "Country", "Email", "Roles", "Verified"],
      filtered.map((p) => [p.nickname, p.player_id, p.platform, p.clan, p.country, p.email, p.roles.join(", "), p.verified ? "Yes" : "No"])
    );
  };

  const toggleVerify = async (profileId: string, currentVerified: boolean) => {
    const { error } = await supabase.from("profiles").update({ verified: !currentVerified }).eq("id", profileId);
    if (error) { toast.error(error.message); return; }
    toast.success(currentVerified ? "Verificación revocada" : "Jugador verificado");
    fetchPlayers();
  };

  const deletePlayer = async (p: PlayerWithRoles) => {
    if (p.user_id === user?.id) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }
    // Delete related data first
    await supabase.from("tournament_registrations").delete().eq("user_id", p.user_id);
    await supabase.from("user_roles").delete().eq("user_id", p.user_id);
    const { error } = await supabase.from("profiles").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Jugador ${p.nickname} eliminado`);
    fetchPlayers();
  };

  const currentRole = (p: PlayerWithRoles) => {
    if (p.roles.includes("admin")) return "admin";
    if (p.roles.includes("content_creator")) return "content_creator";
    return "player";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando jugadores...</div>;

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
        <Input placeholder="Search nickname, ID or clan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>Player ID</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden md:table-cell">Clan</TableHead>
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
                <TableCell className="text-muted-foreground font-mono text-xs">{p.player_id}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{p.platform}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{p.clan}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{p.country}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{p.email}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{currentRole(p)}</Badge></TableCell>
                <TableCell>
                  {p.verified ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVerify(p.id, p.verified)} title={p.verified ? "Unverify" : "Verify"}>
                      <CheckCircle className={`h-4 w-4 ${p.verified ? "text-green-400" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePlayer(p)} title="Delete" disabled={p.user_id === user?.id}>
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
