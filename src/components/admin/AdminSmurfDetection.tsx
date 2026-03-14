import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, Ban, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SuspiciousPlayer {
  user_id: string;
  nickname: string;
  player_id: string;
  platform: string;
  clan: string;
  created_at: string;
  tournaments: number;
  wins: number;
  reason: string;
}

export default function AdminSmurfDetection() {
  const { user, profile } = useAuth();
  const [suspects, setSuspects] = useState<SuspiciousPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").eq("status", "active");
      const { data: regs } = await supabase.from("tournament_registrations").select("nickname");
      const { data: champions } = await supabase.from("tournament_champions").select("team_name");

      if (!profiles) { setLoading(false); return; }

      const regCount = new Map<string, number>();
      regs?.forEach((r: any) => { regCount.set(r.nickname, (regCount.get(r.nickname) || 0) + 1); });

      const winCount = new Map<string, number>();
      champions?.forEach((c: any) => { winCount.set(c.team_name, (winCount.get(c.team_name) || 0) + 1); });

      // Detect duplicate Player IDs
      const playerIdMap = new Map<string, any[]>();
      profiles.forEach((p: any) => {
        if (!playerIdMap.has(p.player_id)) playerIdMap.set(p.player_id, []);
        playerIdMap.get(p.player_id)!.push(p);
      });

      const flagged: SuspiciousPlayer[] = [];

      // Flag duplicate player IDs
      playerIdMap.forEach((players, pid) => {
        if (players.length > 1) {
          players.forEach((p) => {
            flagged.push({
              user_id: p.user_id,
              nickname: p.nickname,
              player_id: p.player_id,
              platform: p.platform,
              clan: p.clan,
              created_at: p.created_at,
              tournaments: regCount.get(p.nickname) || 0,
              wins: winCount.get(p.clan || p.nickname) || 0,
              reason: `Player ID duplicado (${players.length} cuentas)`,
            });
          });
        }
      });

      // Flag new accounts with high win rate (possible smurfs)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      profiles.forEach((p: any) => {
        const createdAt = new Date(p.created_at);
        const tournaments = regCount.get(p.nickname) || 0;
        const wins = winCount.get(p.clan || p.nickname) || 0;
        if (createdAt > thirtyDaysAgo && tournaments >= 2 && wins >= 2) {
          if (!flagged.some((f) => f.user_id === p.user_id)) {
            flagged.push({
              user_id: p.user_id,
              nickname: p.nickname,
              player_id: p.player_id,
              platform: p.platform,
              clan: p.clan,
              created_at: p.created_at,
              tournaments,
              wins,
              reason: "Posible smurf: cuenta nueva con alto rendimiento",
            });
          }
        }
      });

      setSuspects(flagged);
      setLoading(false);
    };
    fetch();
  }, []);

  const markVerified = async (s: SuspiciousPlayer) => {
    await supabase.from("profiles").update({ verified: true }).eq("user_id", s.user_id);
    await supabase.from("moderation_logs").insert({
      admin_user_id: user!.id,
      admin_nickname: profile?.nickname ?? "Admin",
      target_user_id: s.user_id,
      target_nickname: s.nickname,
      action: "Marked as verified player",
      reason: "Cleared smurf flag",
    });
    toast.success(`${s.nickname} marcado como verificado`);
    setSuspects((prev) => prev.filter((p) => p.user_id !== s.user_id));
  };

  const suspendAccount = async (s: SuspiciousPlayer) => {
    await supabase.from("profiles").update({ status: "suspended" }).eq("user_id", s.user_id);
    await supabase.from("moderation_logs").insert({
      admin_user_id: user!.id,
      admin_nickname: profile?.nickname ?? "Admin",
      target_user_id: s.user_id,
      target_nickname: s.nickname,
      action: "Suspended user",
      reason: "Smurf detection",
      detail: s.reason,
    });
    toast.success(`${s.nickname} suspendido`);
    setSuspects((prev) => prev.filter((p) => p.user_id !== s.user_id));
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Analizando cuentas...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Detección Anti-Smurf</h2>
      </div>

      {suspects.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No se detectaron cuentas sospechosas.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead className="hidden md:table-cell">Torneos</TableHead>
                <TableHead className="hidden md:table-cell">Victorias</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspects.map((s) => (
                <TableRow key={s.user_id + s.reason}>
                  <TableCell className="font-medium text-foreground">{s.nickname}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{s.player_id}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.tournaments}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.wins}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 text-xs">{s.reason}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markVerified(s)} title="Marcar como verificado">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => suspendAccount(s)} title="Suspender cuenta">
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
