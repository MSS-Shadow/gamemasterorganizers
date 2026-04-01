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
      } catch (error: any) {
        console.error("Error cargando jugadores:", error);
        toast.error("Error al cargar jugadores");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div className="p-8 text-center text-zinc-400">Cargando jugadores...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Jugadores Registrados</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Player ID</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Registrado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.nickname}</TableCell>
              <TableCell>{player.player_id}</TableCell>
              <TableCell>{player.platform}</TableCell>
              <TableCell>{player.country}</TableCell>
              <TableCell>{new Date(player.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
