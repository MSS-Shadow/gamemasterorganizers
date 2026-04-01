import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminRoleManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          email, 
          nickname, 
          is_clan_leader,
          user_roles!inner(role)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar roles");
        setUsers([]);
        return;
      }

      // Procesamiento seguro para evitar .toLowerCase() en null
      const processed = (data || []).map((user: any) => ({
        ...user,
        roles: Array.isArray(user.user_roles) 
          ? user.user_roles.map((r: any) => r?.role).filter(Boolean)
          : []
      }));

      setUsers(processed);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error("Error inesperado al cargar roles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Cargando gestión de roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Roles</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Actualizar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Clan Leader</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-zinc-400">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nickname || "—"}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>
                <TableCell>
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role: string, i: number) => (
                      <Badge key={i} variant="secondary" className="mr-1">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-zinc-500">Sin roles</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_clan_leader ? "✅ Sí" : "❌ No"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
