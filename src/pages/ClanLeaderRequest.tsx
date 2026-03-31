import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  clan_name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(50),
  description: z.string().trim().max(500).optional(),
});

export default function ClanLeaderRequest() {
  const { user, profile, roles, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ clan_name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [clanExists, setClanExists] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  // Verificar si ya tiene solicitud pendiente
  useEffect(() => {
    const checkRequest = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("clan_leader_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1);

      setHasPendingRequest((data?.length ?? 0) > 0);
    };
    checkRequest();
  }, [user]);

  // Verificar si el clan ya existe
  const checkClanName = async (name: string) => {
    if (name.length < 3) {
      setClanExists(false);
      return;
    }

    setChecking(true);
    const { data } = await supabase
      .from("clans")
      .select("id")
      .eq("name", name.trim())
      .limit(1);

    setClanExists((data?.length ?? 0) > 0);
    setChecking(false);
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === "clan_name") checkClanName(value);
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error("Debes estar logueado");
      return;
    }

    const result = requestSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (clanExists) {
      toast.error("Ya existe un clan con ese nombre");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("clan_leader_requests").insert({
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      clan_name: form.clan_name.trim(),
      email: profile.email,
      description: form.description.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Ya tienes una solicitud pendiente" : error.message);
      return;
    }

    toast.success("✅ Solicitud enviada correctamente. Un administrador la revisará pronto.");
    setHasPendingRequest(true);
    setForm({ clan_name: "", description: "" });
  };

  if (loading) return <div className="text-center py-20">Cargando...</div>;

  if (roles.includes("clan_leader")) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ya eres líder de clan</h1>
        <p className="text-muted-foreground mb-6">Puedes gestionar tu clan desde la página de Equipos.</p>
        <Button onClick={() => navigate("/teams")}>Ir a Equipos</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Solicitar ser Líder de Clan</h1>
          <p className="text-sm text-muted-foreground">Crea tu propio clan en BloodStrike</p>
        </div>
      </div>

      {hasPendingRequest ? (
        <div className="bg-card border border-amber-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Solicitud en revisión</h3>
          <p className="text-muted-foreground">Ya tienes una solicitud pendiente. Te notificaremos cuando sea revisada.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Nickname</label>
              <Input value={profile?.nickname ?? ""} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Player ID</label>
              <Input value={profile?.player_id ?? ""} disabled className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Nombre del Clan *</label>
            <Input
              value={form.clan_name}
              onChange={(e) => updateForm("clan_name", e.target.value)}
              placeholder="Ej: Los Shadow"
              maxLength={50}
              className={clanExists ? "border-red-500" : ""}
            />
            {clanExists && <p className="text-red-500 text-xs mt-1">Este nombre ya está en uso</p>}
            {checking && <p className="text-xs text-muted-foreground mt-1">Verificando disponibilidad...</p>}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Descripción (opcional)</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="¿Qué estilo de juego tiene tu clan? ¿Objetivos?"
              rows={4}
              maxLength={500}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !form.clan_name.trim() || clanExists || checking}
            className="w-full py-6"
          >
            {submitting ? "Enviando solicitud..." : "Enviar Solicitud"}
          </Button>
        </div>
      )}
    </div>
  );
}
