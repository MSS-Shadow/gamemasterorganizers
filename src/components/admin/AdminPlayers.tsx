import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, nickname, player_id, platform, country, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPlayers(data || []);
      } catch (err: any) {
        console.error(err);
        toast.error("Error al cargar jugadores");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div className="p-12 text-center">Cargando jugadores...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Jugadores Registrados ({players.length})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Player ID</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>País</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-zinc-400">
                No hay jugadores registrados
              </TableCell>
            </TableRow>
          ) : (
            players.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.nickname || "—"}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.player_id || "—"}</TableCell>
                <TableCell>{p.platform}</TableCell>
                <TableCell>{p.country}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
