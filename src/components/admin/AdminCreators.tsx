import { useState } from "react";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { mockCreatorRequests, type MockCreatorRequest } from "@/lib/mockAdminData";

export default function AdminCreators() {
  const [requests, setRequests] = useState<MockCreatorRequest[]>(mockCreatorRequests);

  const updateStatus = (id: string, status: "Approved" | "Rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const statusColor = (s: string) => {
    if (s === "Approved") return "bg-green-600/20 text-green-400 border-green-600/30";
    if (s === "Rejected") return "bg-destructive/20 text-destructive border-destructive/30";
    return "bg-primary/20 text-primary border-primary/30";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Content Creators</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="hidden md:table-cell">Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-foreground">{r.nickname}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{r.email}</TableCell>
                <TableCell><Badge variant="outline">{r.platform}</Badge></TableCell>
                <TableCell className="hidden md:table-cell">
                  <a href={r.channelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    <ExternalLink className="h-3 w-3" /> Link
                  </a>
                </TableCell>
                <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {r.status === "Pending" && (
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(r.id, "Approved")} title="Approve">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(r.id, "Rejected")} title="Reject">
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
    </div>
  );
}
