import { useState, useEffect } from "react";
import { ShieldCheck, Eye, CheckCircle, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminVerification() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRequest, setViewRequest] = useState<any | null>(null);

  const fetchRequests = async () => {
    const { data } = await supabase.from("verification_requests").select("*").order("created_at", { ascending: false });
    setRequests((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    const request = requests.find((r) => r.id === id);
    await supabase.from("verification_requests").update({
      status: decision,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);

    if (decision === "approved" && request) {
      await supabase.from("profiles").update({ verified: true }).eq("user_id", request.user_id);
    }

    toast.success(decision === "approved" ? "Verificación aprobada" : "Verificación rechazada");
    setViewRequest(null);
    fetchRequests();
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-600/20 text-green-400";
    if (status === "rejected") return "bg-destructive/20 text-destructive";
    return "bg-yellow-600/20 text-yellow-400";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Solicitudes de Verificación</h2>

      {requests.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.nickname}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{r.player_id}</TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString("es")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRequest(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No hay solicitudes de verificación.</p>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Verificación: {viewRequest?.nickname}</DialogTitle></DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nickname:</span> <span className="text-foreground font-medium">{viewRequest.nickname}</span></div>
                <div><span className="text-muted-foreground">Player ID:</span> <span className="text-foreground font-mono">{viewRequest.player_id}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{viewRequest.email}</span></div>
                <div><span className="text-muted-foreground">Estado:</span> <Badge className={statusColor(viewRequest.status)}>{viewRequest.status}</Badge></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Archivos Adjuntos:</p>
                {viewRequest.profile_screenshot_url && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Captura de Perfil</span>
                    <div className="flex gap-2">
                      <a href={viewRequest.profile_screenshot_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button></a>
                      <a href={viewRequest.profile_screenshot_url} download><Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1" /> Descargar</Button></a>
                    </div>
                  </div>
                )}
                {viewRequest.id_screenshot_url && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Captura de Player ID</span>
                    <div className="flex gap-2">
                      <a href={viewRequest.id_screenshot_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button></a>
                      <a href={viewRequest.id_screenshot_url} download><Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1" /> Descargar</Button></a>
                    </div>
                  </div>
                )}
                {viewRequest.additional_doc_url && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <span className="text-sm text-muted-foreground">Documento Adicional</span>
                    <div className="flex gap-2">
                      <a href={viewRequest.additional_doc_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button></a>
                      <a href={viewRequest.additional_doc_url} download><Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1" /> Descargar</Button></a>
                    </div>
                  </div>
                )}
              </div>

              {viewRequest.status === "pending" && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleDecision(viewRequest.id, "approved")}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleDecision(viewRequest.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-1" /> Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
