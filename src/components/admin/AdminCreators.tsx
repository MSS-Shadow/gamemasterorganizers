import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function AdminCreators() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from("creator_requests").select("*").order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, status: string, userId: string) => {
    const { error } = await supabase.from("creator_requests").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }

    if (status === "Approved") {
      // Add content_creator role
      await supabase.from("user_roles").insert({ user_id: userId, role: "content_creator" as any });
    }

    toast.success(`Solicitud ${status === "Approved" ? "aprobada" : "rechazada"}`);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Solicitudes de Creadores ({requests.length})</h2>
        <Button variant="ghost" size="sm" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Cargando...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay solicitudes de creadores.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nickname}</TableCell>
                  <TableCell className="text-xs">{r.email}</TableCell>
                  <TableCell>{r.platform}</TableCell>
                  <TableCell>
                    <a href={r.channel_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-0.5">
                      <ExternalLink className="h-3 w-3" /> Ver Canal
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Approved" ? "default" : r.status === "Rejected" ? "destructive" : "secondary"} className="text-xs">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("es")}</TableCell>
                  <TableCell>
                    {r.status === "Pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleAction(r.id, "Approved", r.user_id)}>Aprobar</Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleAction(r.id, "Rejected", r.user_id)}>Rechazar</Button>
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
