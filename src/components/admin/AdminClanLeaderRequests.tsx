import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Request {
  id: string;
  user_id: string;
  nickname: string;
  player_id: string;
  clan_name: string;
  email: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function AdminClanLeaderRequests() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from("clan_leader_requests").select("*").order("created_at", { ascending: false });
    setRequests((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (req: Request, action: "approved" | "rejected") => {
    // Update request status
    const { error } = await supabase.from("clan_leader_requests").update({
      status: action,
      reviewed_at: new Date().toISOString(),
    }).eq("id", req.id);
    if (error) { toast.error(error.message); return; }

    if (action === "approved") {
      // Add clan_leader role
      await supabase.from("user_roles").insert({ user_id: req.user_id, role: "clan_leader" as any });

      // Create clan if it doesn't exist
      const { data: existing } = await supabase.from("clans").select("id").eq("name", req.clan_name);
      if (!existing || existing.length === 0) {
        await supabase.from("clans").insert({
          name: req.clan_name,
          leader_user_id: req.user_id,
          leader_nickname: req.nickname,
        });
      }

      // Log moderation action
      await supabase.from("moderation_logs").insert({
        admin_user_id: user!.id,
        admin_nickname: profile?.nickname ?? "Admin",
        target_user_id: req.user_id,
        target_nickname: req.nickname,
        action: "Approved clan leader request",
        reason: `Clan: ${req.clan_name}`,
      });
    }

    toast.success(action === "approved" ? `${req.nickname} aprobado como líder de ${req.clan_name}` : "Solicitud rechazada");
    fetchRequests();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Solicitudes de Líder de Clan</h2>

      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay solicitudes.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Clan</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.nickname}</TableCell>
                  <TableCell className="text-muted-foreground">{r.clan_name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{r.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">{r.description || "—"}</TableCell>
                  <TableCell>
                    <Badge className={r.status === "approved" ? "bg-green-600/20 text-green-400" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(r, "approved")} title="Aprobar">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(r, "rejected")} title="Rechazar">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
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
