import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { mockActivityLog } from "@/lib/mockAdminData";

const actionColor = (action: string) => {
  if (action.includes("Deleted")) return "bg-destructive/20 text-destructive border-destructive/30";
  if (action.includes("Approved")) return "bg-green-600/20 text-green-400 border-green-600/30";
  if (action.includes("Created")) return "bg-primary/20 text-primary border-primary/30";
  return "bg-accent/20 text-accent border-accent/30";
};

export default function AdminActivityLog() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Admin Activity Log</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="hidden md:table-cell">Admin</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockActivityLog.map((log) => (
              <TableRow key={log.id}>
                <TableCell><Badge className={actionColor(log.action)}>{log.action}</Badge></TableCell>
                <TableCell className="text-foreground text-sm">{log.detail}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.admin}</TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
