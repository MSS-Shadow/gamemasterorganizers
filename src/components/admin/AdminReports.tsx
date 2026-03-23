import { useState, useEffect } from "react";
import { AlertTriangle, Eye, CheckCircle, Ban, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminReports() {
  const { user, profile: adminProfile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    setReports((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const resolveReport = async (id: string, action: string) => {
    const report = reports.find((r) => r.id === id);
    await supabase.from("reports").update({
      status: "resolved",
      admin_notes: adminNotes || action,
      resolved_at: new Date().toISOString(),
    }).eq("id", id);

    if (action === "suspend" || action === "ban") {
      const { data: targetProfile } = await supabase.from("profiles").select("*").eq("nickname", report.reported_player).single();
      if (targetProfile) {
        const status = action === "ban" ? "banned" : "suspended";
        await supabase.from("profiles").update({ status }).eq("id", (targetProfile as any).id);
        await supabase.from("moderation_logs").insert({
          admin_user_id: user!.id,
          admin_nickname: adminProfile?.nickname ?? "Admin",
          target_user_id: (targetProfile as any).user_id,
          target_nickname: report.reported_player,
          action: action === "ban" ? "Banned user" : "Suspended user",
          reason: `Report: ${report.category}`,
          detail: report.description,
        });
      }
    }

    toast.success("Reporte procesado");
    setViewReport(null);
    setAdminNotes("");
    fetchReports();
  };

  const statusColor = (status: string) => {
    if (status === "resolved") return "bg-green-600/20 text-green-400";
    return "bg-yellow-600/20 text-yellow-400";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Reportes</h2>

      {reports.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reportado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.reported_player}</TableCell>
                  <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{r.reporter_nickname}</TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString("es")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setViewReport(r); setAdminNotes(r.admin_notes || ""); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No hay reportes.</p>
      )}

      {/* View Report Dialog */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Detalle del Reporte</DialogTitle></DialogHeader>
          {viewReport && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Reportado:</span> <span className="text-foreground font-medium">{viewReport.reported_player}</span></div>
                <div><span className="text-muted-foreground">Categoría:</span> <span className="text-foreground">{viewReport.category}</span></div>
                <div><span className="text-muted-foreground">Reportado por:</span> <span className="text-foreground">{viewReport.reporter_nickname}</span></div>
                <div><span className="text-muted-foreground">Fecha:</span> <span className="text-foreground">{new Date(viewReport.created_at).toLocaleDateString("es")}</span></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descripción:</p>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{viewReport.description}</p>
              </div>
              {viewReport.screenshot_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Evidencia:</p>
                  <a href={viewReport.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Ver archivo adjunto</a>
                </div>
              )}
              {viewReport.status === "pending" && (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Notas del Admin</label>
                    <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} placeholder="Notas opcionales..." />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => resolveReport(viewReport.id, "resolved")}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                    </Button>
                    <Button variant="outline" className="flex-1 text-yellow-400" onClick={() => resolveReport(viewReport.id, "suspend")}>
                      <ShieldAlert className="h-4 w-4 mr-1" /> Suspender
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => resolveReport(viewReport.id, "ban")}>
                      <Ban className="h-4 w-4 mr-1" /> Banear
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
