import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, BarChart3, Image, Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const { user, isClanLeader } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scrims");

  // Redirigir si no es creador
  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard de Creador</h1>
          <p className="text-zinc-400">Bienvenido, {user?.email}</p>
        </div>
        <Button onClick={() => navigate("/scrims")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Scrim
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scrims">Scrims</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="brackets">Brackets</TabsTrigger>
          <TabsTrigger value="announcements">Anuncios</TabsTrigger>
        </TabsList>

        {/* Scrims Tab */}
        <TabsContent value="scrims">
          <Card>
            <CardHeader>
              <CardTitle>Mis Scrims</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Aquí podrás crear y gestionar tus scrims.</p>
              {/* Aquí irán los scrims reales más adelante */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring">
          <Card>
            <CardHeader>
              <CardTitle>Puntuación y Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Accede al scoring de torneos y scrims.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brackets Tab */}
        <TabsContent value="brackets">
          <Card>
            <CardHeader>
              <CardTitle>Brackets en Vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Visualiza brackets de torneos activos.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Publicar Anuncios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Crea anuncios para tus seguidores.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
