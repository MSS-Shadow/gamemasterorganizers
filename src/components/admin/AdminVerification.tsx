import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminVerification() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nickname, email, player_id, platform, country, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error en profiles:", error);
          toast.error("Error al cargar usuarios");
          setUsers([]);
          return;
        }

        setUsers(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando verificaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verificación de Cuentas</h2>
      <p className="text-zinc-400 mb-4">Usuarios registrados ({users.length})</p>

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
                No hay usuarios para verificar
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nickname || "—"}</TableCell>
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
