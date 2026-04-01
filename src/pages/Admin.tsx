import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPlayers from "@/components/admin/AdminPlayers";
import AdminCreators from "@/components/admin/AdminCreators";
import AdminVerification from "@/components/admin/AdminVerification";
import AdminRoleManager from "@/components/admin/AdminRoleManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Administrador</h1>
        <p className="text-zinc-400">Gestiona la plataforma Game Master Organizers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="players">Jugadores</TabsTrigger>
          <TabsTrigger value="creators">Creadores</TabsTrigger>
          <TabsTrigger value="verification">Verificación</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="players">
          <AdminPlayers />
        </TabsContent>

        <TabsContent value="creators">
          <AdminCreators />
        </TabsContent>

        <TabsContent value="verification">
          <AdminVerification />
        </TabsContent>

        <TabsContent value="roles">
          <AdminRoleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
