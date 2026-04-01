import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminVerification() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nickname, email, player_id, platform, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        toast.error("Error al cargar verificaciones");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-12 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verificación de Cuentas</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Player ID</TableHead>
            <TableHead>Plataforma</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.nickname}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.player_id || "—"}</TableCell>
              <TableCell>{u.platform}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
