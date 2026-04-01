import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPlayers from "@/components/admin/AdminPlayers";
import AdminCreators from "@/components/admin/AdminCreators";
import AdminVerification from "@/components/admin/AdminVerification";
import AdminRoleManager from "@/components/admin/AdminRoleManager";

// Placeholders temporales para las pestañas que aún no tienen componente completo
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
    <h3 className="text-2xl font-medium mb-4">{title}</h3>
    <p className="text-zinc-400">Esta sección se está configurando y estará disponible muy pronto.</p>
  </div>
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Administrador</h1>
        <p className="text-zinc-400">Gestiona toda la plataforma Game Master Organizers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8 text-xs overflow-x-auto">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="players">👥 Jugadores</TabsTrigger>
          <TabsTrigger value="creators">⭐ Creadores</TabsTrigger>
          <TabsTrigger value="clan-leaders">🏆 Clan Leaders</TabsTrigger>
          <TabsTrigger value="tournaments">🏆 Torneos</TabsTrigger>
          <TabsTrigger value="scoring">📈 Scoring</TabsTrigger>
          <TabsTrigger value="brackets">🔗 Brackets</TabsTrigger>
          <TabsTrigger value="scrims">⚔️ Scrims</TabsTrigger>
          <TabsTrigger value="lobbies">🎮 Lobbies</TabsTrigger>
          <TabsTrigger value="roles">🔑 Roles</TabsTrigger>
          <TabsTrigger value="verification">✅ Verificación</TabsTrigger>
          <TabsTrigger value="reports">📋 Reportes</TabsTrigger>
          <TabsTrigger value="announcements">📢 Anuncios</TabsTrigger>
          <TabsTrigger value="smurf">🚩 Smurf Detection</TabsTrigger>
          <TabsTrigger value="moderation">🛡️ Moderación</TabsTrigger>
          <TabsTrigger value="backup">💾 Respaldo</TabsTrigger>
          <TabsTrigger value="site-config">⚙️ Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
        <TabsContent value="players"><AdminPlayers /></TabsContent>
        <TabsContent value="creators"><AdminCreators /></TabsContent>
        <TabsContent value="clan-leaders"><Placeholder title="Solicitudes de Clan Leaders" /></TabsContent>
        <TabsContent value="tournaments"><Placeholder title="Gestión de Torneos" /></TabsContent>
        <TabsContent value="scoring"><Placeholder title="Scoring de Torneos" /></TabsContent>
        <TabsContent value="brackets"><Placeholder title="Gestión de Brackets" /></TabsContent>
        <TabsContent value="scrims"><Placeholder title="Gestión de Scrims" /></TabsContent>
        <TabsContent value="lobbies"><Placeholder title="Generador de Lobbies" /></TabsContent>
        <TabsContent value="roles"><AdminRoleManager /></TabsContent>
        <TabsContent value="verification"><AdminVerification /></TabsContent>
        <TabsContent value="reports"><Placeholder title="Reportes" /></TabsContent>
        <TabsContent value="announcements"><Placeholder title="Anuncios" /></TabsContent>
        <TabsContent value="smurf"><Placeholder title="Detección de Smurfs" /></TabsContent>
        <TabsContent value="moderation"><Placeholder title="Moderación" /></TabsContent>
        <TabsContent value="backup"><Placeholder title="Respaldo" /></TabsContent>
        <TabsContent value="site-config"><Placeholder title="Configuración del Sitio" /></TabsContent>
      </Tabs>
    </div>
  );
}
