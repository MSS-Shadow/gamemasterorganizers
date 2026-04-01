import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminVerification() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nickname, email, player_id, platform, country, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.warn("Error en profiles:", error.message);
          if (isMounted) setUsers([]);
          return;
        }

        if (isMounted) setUsers(data || []);
      } catch (err) {
        console.warn("Error inesperado:", err);
        if (isMounted) setUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando verificaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verificación de Cuentas</h2>
      <p className="text-zinc-400">Usuarios registrados: {users.length}</p>

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
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                No hay usuarios registrados aún
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.nickname || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.player_id || "—"}</TableCell>
                <TableCell>{user.platform}</TableCell>
                <TableCell>{user.country}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
