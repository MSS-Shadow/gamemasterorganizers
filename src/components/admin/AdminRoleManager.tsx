import { useState, useEffect } from "react";
import { Search, ShieldCheck, ShieldX, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface UserWithRoles extends Profile {
  roles: string[];
}

const roleBadgeClass: Record<string, string> = {
  admin: "bg-destructive/20 text-destructive border-destructive/30",
  content_creator: "bg-primary/20 text-primary border-primary/30",
  player: "bg-green-600/20 text-green-400 border-green-600/30",
};

export default function AdminRoleManager() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: allRoles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const mapped: UserWithRoles[] = profiles.map((p) => ({
        ...p,
        roles: allRoles?.filter((r) => r.user_id === p.user_id).map((r) => r.role) ?? [],
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.nickname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.player_id.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (targetUserId: string, newRole: string, nickname: string) => {
    if (targetUserId === user?.id) {
      toast.error("No puedes modificar tu propio rol.");
      return;
    }

    // Remove existing non-player roles, then add new one
    const rolesToRemove = ["admin", "content_creator"] as const;
    for (const role of rolesToRemove) {
      await supabase.from("user_roles").delete().eq("user_id", targetUserId).eq("role", role);
    }

    if (newRole !== "player") {
      await supabase.from("user_roles").insert({ user_id: targetUserId, role: newRole as any });
    }

    toast.success(`Rol de ${nickname} cambiado a ${newRole}`);
    fetchUsers();
  };

  const revokeCreator = async (targetUserId: string, nickname: string) => {
    await supabase.from("user_roles").delete().eq("user_id", targetUserId).eq("role", "content_creator");
    toast.success(`Rol de creador revocado para ${nickname}`);
    fetchUsers();
  };

  const currentRole = (u: UserWithRoles) => {
    if (u.roles.includes("admin")) return "admin";
    if (u.roles.includes("content_creator")) return "content_creator";
    return "player";
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <UserCog className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">User Role Manager</h2>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nickname, email o ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Cambiar Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.nickname}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <Badge key={r} className={roleBadgeClass[r] ?? ""}>{r}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={currentRole(u)} onValueChange={(val) => changeRole(u.user_id, val, u.nickname)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="content_creator">Content Creator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {u.roles.includes("content_creator") && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => revokeCreator(u.user_id, u.nickname)} title="Revocar creador">
                        <ShieldX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No se encontraron usuarios.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
