import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatorRequest {
  id: string;
  user_id: string;
  nickname: string;
  email: string;
  platform: string;
  channel_link: string;
  status: string;
  created_at: string;
}

export default function AdminCreators() {
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from("creator_requests").select("*").order("created_at", { ascending: false });
    setRequests((data as CreatorRequest[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (req: CreatorRequest, newStatus: "Approved" | "Rejected") => {
    const { error } = await supabase.from("creator_requests").update({ status: newStatus, reviewed_at: new Date().toISOString() }).eq("id", req.id);
    if (error) { toast.error(error.message); return; }

    if (newStatus === "Approved") {
      // Grant content_creator role
      await supabase.from("user_roles").insert({ user_id: req.user_id, role: "content_creator" as any });
      toast.success(`${req.nickname} aprobado como creador`);
    } else {
      toast.success(`Solicitud de ${req.nickname} rechazada`);
    }
    fetchRequests();
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase.from("creator_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Solicitud eliminada");
    fetchRequests();
  };

  const statusColor = (s: string) => {
    if (s === "Approved") return "bg-green-600/20 text-green-400 border-green-600/30";
    if (s === "Rejected") return "bg-destructive/20 text-destructive border-destructive/30";
    return "bg-primary/20 text-primary border-primary/30";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Creadores de Contenido</h2>
      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay solicitudes de creadores.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="hidden md:table-cell">Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.nickname}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{r.email}</TableCell>
                  <TableCell><Badge variant="outline">{r.platform}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a href={r.channel_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                      <ExternalLink className="h-3 w-3" /> Link
                    </a>
                  </TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === "Pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(r, "Approved")} title="Aprobar">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(r, "Rejected")} title="Rechazar">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRequest(r.id)} title="Eliminar">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
