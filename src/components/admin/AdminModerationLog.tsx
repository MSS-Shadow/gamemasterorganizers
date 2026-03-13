import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ModerationLog {
  id: string;
  admin_nickname: string;
  target_nickname: string;
  action: string;
  reason: string;
  detail: string | null;
  created_at: string;
}

const actionColor = (action: string) => {
  if (action.includes("Deleted")) return "bg-destructive/20 text-destructive border-destructive/30";
  if (action.includes("Banned")) return "bg-destructive/20 text-destructive border-destructive/30";
  if (action.includes("Suspended")) return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
  if (action.includes("Reactivated")) return "bg-green-600/20 text-green-400 border-green-600/30";
  return "bg-accent/20 text-accent border-accent/30";
};

export default function AdminModerationLog() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as ModerationLog[]) ?? []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando logs...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Admin Moderation Log</h2>
      {logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No moderation actions recorded yet.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="hidden md:table-cell">Detail</TableHead>
                <TableHead className="hidden md:table-cell">Admin</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell><Badge className={actionColor(log.action)}>{log.action}</Badge></TableCell>
                  <TableCell className="text-foreground font-medium">{log.target_nickname}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{log.reason}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{log.detail || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.admin_nickname}</TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
