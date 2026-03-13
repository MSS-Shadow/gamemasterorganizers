import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Legacy activity log - kept for backwards compatibility, real logs are in Moderation Log tab
export default function AdminActivityLog() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Log de Actividad Admin</h2>
      <p className="text-center text-muted-foreground py-8">
        El registro de actividad se ha migrado a la pestaña "Log de Moderación" para acciones de moderación en tiempo real.
      </p>
    </div>
  );
}
