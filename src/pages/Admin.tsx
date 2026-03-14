import { useState } from "react";
import { Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPlayers from "@/components/admin/AdminPlayers";
import AdminCreators from "@/components/admin/AdminCreators";
import AdminTournamentRegistrations from "@/components/admin/AdminTournamentRegistrations";
import AdminScrimParticipants from "@/components/admin/AdminScrimParticipants";
import AdminLobbyGenerator from "@/components/admin/AdminLobbyGenerator";
import AdminModerationLog from "@/components/admin/AdminModerationLog";
import AdminBackup from "@/components/admin/AdminBackup";
import AdminRoleManager from "@/components/admin/AdminRoleManager";
import AdminClanLeaderRequests from "@/components/admin/AdminClanLeaderRequests";
import AdminBracketManager from "@/components/admin/AdminBracketManager";
import AdminSmurfDetection from "@/components/admin/AdminSmurfDetection";

export default function AdminPage() {
  const [globalSearch, setGlobalSearch] = useState("");
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground">Necesitas privilegios de administrador para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Game Master Organizers — Gestión</p>
          </div>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-card border border-border p-1">
          <TabsTrigger value="dashboard" className="text-xs">Panel</TabsTrigger>
          <TabsTrigger value="players" className="text-xs">Jugadores</TabsTrigger>
          <TabsTrigger value="creators" className="text-xs">Creadores</TabsTrigger>
          <TabsTrigger value="clan-leaders" className="text-xs">Líderes Clan</TabsTrigger>
          <TabsTrigger value="tournaments" className="text-xs">Torneos</TabsTrigger>
          <TabsTrigger value="brackets" className="text-xs">Brackets</TabsTrigger>
          <TabsTrigger value="scrims" className="text-xs">Scrims</TabsTrigger>
          <TabsTrigger value="lobbies" className="text-xs">Lobbies</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
          <TabsTrigger value="smurf" className="text-xs">Anti-Smurf</TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs">Moderación</TabsTrigger>
          <TabsTrigger value="backup" className="text-xs">Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
        <TabsContent value="players"><AdminPlayers /></TabsContent>
        <TabsContent value="creators"><AdminCreators /></TabsContent>
        <TabsContent value="clan-leaders"><AdminClanLeaderRequests /></TabsContent>
        <TabsContent value="tournaments"><AdminTournamentRegistrations /></TabsContent>
        <TabsContent value="brackets"><AdminBracketManager /></TabsContent>
        <TabsContent value="scrims"><AdminScrimParticipants /></TabsContent>
        <TabsContent value="lobbies"><AdminLobbyGenerator /></TabsContent>
        <TabsContent value="roles"><AdminRoleManager /></TabsContent>
        <TabsContent value="smurf"><AdminSmurfDetection /></TabsContent>
        <TabsContent value="moderation"><AdminModerationLog /></TabsContent>
        <TabsContent value="backup"><AdminBackup /></TabsContent>
      </Tabs>
    </div>
  );
}
