import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminCreators() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Intentamos cargar creator_requests de forma segura
        const { data, error } = await supabase
          .from("creator_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.warn("Tabla creator_requests no existe aún:", error.message);
          setRequests([]);
          return;
        }

        setRequests(data || []);
      } catch (err) {
        console.warn("Error cargando creadores:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando solicitudes de creadores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Solicitudes de Creadores</h2>
        <Badge variant="secondary">Próximamente</Badge>
      </div>

      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
          <p className="text-zinc-400 text-lg">
            Aún no hay solicitudes de creadores.<br />
            Cuando los usuarios soliciten ser creadores, aparecerán aquí.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Link del Canal</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.nickname}</TableCell>
                <TableCell>{req.platform}</TableCell>
                <TableCell className="max-w-xs truncate">
                  <a href={req.channel_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {req.channel_link}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant={req.status === "Approved" ? "default" : "secondary"}>
                    {req.status || "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
