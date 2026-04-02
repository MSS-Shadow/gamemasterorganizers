import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminRoleManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, nickname, is_clan_leader")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, role: string, currentValue: boolean) => {
    try {
      if (role === "clan_leader") {
        const { error } = await supabase
          .from("profiles")
          .update({ is_clan_leader: !currentValue })
          .eq("id", userId);
        if (error) throw error;
      } else {
        if (!currentValue) {
          await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
        } else {
          await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
        }
      }
      toast.success(`Rol ${role} actualizado`);
      fetchUsers();
    } catch (err: any) {
      toast.error("Error al actualizar rol");
    }
  };

  if (loading) return <div className="p-12 text-center">Cargando usuarios...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Roles</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nickname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nickname || "—"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.is_clan_leader && <Badge className="mr-1">Clan Leader</Badge>}
                <Badge variant="secondary">User</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={user.is_clan_leader ? "destructive" : "default"}
                    onClick={() => toggleRole(user.id, "clan_leader", user.is_clan_leader)}
                  >
                    {user.is_clan_leader ? "Quitar Clan Leader" : "Dar Clan Leader"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleRole(user.id, "admin", false)}
                  >
                    Dar Admin
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
