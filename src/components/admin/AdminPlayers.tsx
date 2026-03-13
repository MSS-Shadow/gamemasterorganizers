import { useState, useEffect } from "react";
import { Search, Download, CheckCircle, Trash2, Ban, ShieldAlert, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface PlayerWithRoles extends Profile {
  roles: string[];
  status: string;
}

const SANCTION_REASONS = [
  "Cheating",
  "Toxic behavior",
  "Tournament abandonment",
  "Rule violation",
  "Repeated misconduct",
  "Other",
];

const statusBadge = (status: string) => {
  if (status === "banned") return "bg-destructive/20 text-destructive border-destructive/30";
  if (status === "suspended") return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
  return "bg-green-600/20 text-green-400 border-green-600/30";
};

export default function AdminPlayers() {
  const { user, profile: adminProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<PlayerWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  // Sanction dialog state
  const [sanctionDialog, setSanctionDialog] = useState<{ open: boolean; player: PlayerWithRoles | null; action: "suspended" | "banned" | "delete" }>({ open: false, player: null, action: "suspended" });
  const [sanctionReason, setSanctionReason] = useState("Rule violation");
  const [sanctionDetail, setSanctionDetail] = useState("");
  const [sanctionLoading, setSanctionLoading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allRoles } = await supabase.from("user_roles").select("*");
    if (profiles) {
      const mapped: PlayerWithRoles[] = profiles.map((p: any) => ({
        ...p,
        status: p.status || "active",
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
    exportToCsv("players", ["Nickname", "Player ID", "Platform", "Clan", "Country", "Email", "Roles", "Status", "Verified"],
      filtered.map((p) => [p.nickname, p.player_id, p.platform, p.clan, p.country, p.email, p.roles.join(", "), p.status, p.verified ? "Yes" : "No"])
    );
  };

  const toggleVerify = async (profileId: string, currentVerified: boolean) => {
    const { error } = await supabase.from("profiles").update({ verified: !currentVerified }).eq("id", profileId);
    if (error) { toast.error(error.message); return; }
    toast.success(currentVerified ? "Verificación revocada" : "Jugador verificado");
    fetchPlayers();
  };

  const openSanctionDialog = (player: PlayerWithRoles, action: "suspended" | "banned" | "delete") => {
    setSanctionDialog({ open: true, player, action });
    setSanctionReason("Rule violation");
    setSanctionDetail("");
  };

  const logModerationAction = async (action: string, targetUserId: string | null, targetNickname: string, reason: string, detail?: string) => {
    await supabase.from("moderation_logs").insert({
      admin_user_id: user!.id,
      admin_nickname: adminProfile?.nickname ?? "Admin",
      target_user_id: targetUserId,
      target_nickname: targetNickname,
      action,
      reason,
      detail,
    });
  };

  const executeSanction = async () => {
    const p = sanctionDialog.player;
    if (!p) return;
    setSanctionLoading(true);

    const actionType = sanctionDialog.action;
    const detailText = sanctionDetail.trim() || undefined;

    if (actionType === "delete") {
      await supabase.from("tournament_registrations").delete().eq("user_id", p.user_id);
      await supabase.from("user_roles").delete().eq("user_id", p.user_id);
      const { error } = await supabase.from("profiles").delete().eq("id", p.id);
      if (error) { toast.error(error.message); setSanctionLoading(false); return; }
      await logModerationAction("Deleted user", p.user_id, p.nickname, sanctionReason, detailText);
      toast.success(`Jugador ${p.nickname} eliminado`);
    } else {
      const { error } = await supabase.from("profiles").update({ status: actionType }).eq("id", p.id);
      if (error) { toast.error(error.message); setSanctionLoading(false); return; }
      const actionLabel = actionType === "banned" ? "Banned user" : "Suspended user";
      await logModerationAction(actionLabel, p.user_id, p.nickname, sanctionReason, detailText);
      toast.success(`${p.nickname} ${actionType === "banned" ? "baneado" : "suspendido"}`);
    }

    setSanctionLoading(false);
    setSanctionDialog({ open: false, player: null, action: "suspended" });
    fetchPlayers();
  };

  const reactivateUser = async (p: PlayerWithRoles) => {
    const { error } = await supabase.from("profiles").update({ status: "active" }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    await logModerationAction("Reactivated user", p.user_id, p.nickname, "Sanction lifted");
    toast.success(`${p.nickname} reactivado`);
    fetchPlayers();
  };

  const currentRole = (p: PlayerWithRoles) => {
    if (p.roles.includes("admin")) return "admin";
    if (p.roles.includes("content_creator")) return "content_creator";
    return "player";
  };

  const actionLabel = sanctionDialog.action === "delete" ? "Eliminar" : sanctionDialog.action === "banned" ? "Banear" : "Suspender";

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
                <TableCell><Badge variant="secondary" className="text-xs">{currentRole(p)}</Badge></TableCell>
                <TableCell>
                  <Badge className={statusBadge(p.status)}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVerify(p.id, p.verified)} title={p.verified ? "Unverify" : "Verify"}>
                      <CheckCircle className={`h-4 w-4 ${p.verified ? "text-green-400" : "text-muted-foreground"}`} />
                    </Button>
                    {p.status !== "active" && p.user_id !== user?.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reactivateUser(p)} title="Reactivar">
                        <ShieldOff className="h-4 w-4 text-green-400" />
                      </Button>
                    )}
                    {p.user_id !== user?.id && p.status === "active" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSanctionDialog(p, "suspended")} title="Suspender">
                        <ShieldAlert className="h-4 w-4 text-yellow-400" />
                      </Button>
                    )}
                    {p.user_id !== user?.id && p.status !== "banned" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSanctionDialog(p, "banned")} title="Banear">
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSanctionDialog(p, "delete")} title="Delete" disabled={p.user_id === user?.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No players found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sanction Dialog */}
      <Dialog open={sanctionDialog.open} onOpenChange={(open) => !open && setSanctionDialog({ open: false, player: null, action: "suspended" })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {sanctionDialog.action === "delete" ? <Trash2 className="h-5 w-5 text-destructive" /> : sanctionDialog.action === "banned" ? <Ban className="h-5 w-5 text-destructive" /> : <ShieldAlert className="h-5 w-5 text-yellow-400" />}
              {actionLabel}: {sanctionDialog.player?.nickname}
            </DialogTitle>
            <DialogDescription>Indica la razón de esta acción de moderación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Reason</label>
              <Select value={sanctionReason} onValueChange={setSanctionReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SANCTION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Detail (optional)</label>
              <Textarea value={sanctionDetail} onChange={(e) => setSanctionDetail(e.target.value)} placeholder="Additional details..." rows={3} />
            </div>
            <Button variant="destructive" className="w-full" onClick={executeSanction} disabled={sanctionLoading}>
              {sanctionLoading ? "Procesando..." : `Confirmar ${actionLabel}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
