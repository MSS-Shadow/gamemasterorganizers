import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminCreators() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        // Consulta ultra segura
        const { data, error } = await supabase
          .from("creator_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          // Si la tabla no existe, mostramos mensaje amigable
          if (error.code === 'PGRST116' || error.message.includes('Could not find the table')) {
            console.warn("Tabla creator_requests aún no existe");
            setRequests([]);
            return;
          }
          throw error;
        }

        setRequests(data || []);
      } catch (err: any) {
        console.warn("Error en AdminCreators:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando creadores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Creadores de Contenido</h2>
        <Badge variant="outline">En desarrollo</Badge>
      </div>

      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
          <h3 className="text-xl font-medium mb-2">Sin solicitudes por el momento</h3>
          <p className="text-zinc-400">
            Cuando los usuarios soliciten ser creadores de contenido, aparecerán aquí para que las revises.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.nickname}</TableCell>
                <TableCell>{req.platform}</TableCell>
                <TableCell className="max-w-md truncate">
                  {req.channel_link ? (
                    <a href={req.channel_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {req.channel_link}
                    </a>
                  ) : "—"}
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
