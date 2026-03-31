import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  clan_name: z.string().trim().min(3, "El nombre del clan debe tener al menos 3 caracteres").max(50, "Máximo 50 caracteres"),
  description: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

export default function ClanLeaderRequest() {
  const { user, profile, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ clan_name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [clanExists, setClanExists] = useState(false);
  const [checkingClan, setCheckingClan] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  // Verificar si ya tiene una solicitud pendiente
  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("clan_leader_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1);

      setHasPendingRequest((data?.length ?? 0) > 0);
    };

    checkPendingRequest();
  }, [user]);

  // Verificar si el nombre del clan ya existe
  const checkClanExists = async (clanName: string) => {
    if (!clanName || clanName.length < 3) {
      setClanExists(false);
      return;
    }

    setCheckingClan(true);
    const { data } = await supabase
      .from("clans")
      .select("id")
      .eq("name", clanName.trim())
      .limit(1);

    setClanExists((data?.length ?? 0) > 0);
    setCheckingClan(false);
  };

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "clan_name") {
      checkClanExists(value);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error("Debes iniciar sesión");
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

    try {
      const { error } = await supabase.from("clan_leader_requests").insert({
        user_id: user.id,
        nickname: profile.nickname,
        player_id: profile.player_id,
        clan_name: form.clan_name.trim(),
        email: profile.email,
        description: form.description.trim() || null,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya tienes una solicitud pendiente o el clan ya existe");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("✅ Solicitud enviada correctamente. Un administrador la revisará pronto.");
      setHasPendingRequest(true);
      setForm({ clan_name: "", description: "" });
    } catch (err: any) {
      toast.error("Error inesperado al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  if (roles.includes("clan_leader")) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Users className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-3">Ya eres Líder de Clan</h1>
        <p className="text-muted-foreground mb-6">Puedes gestionar tu clan desde la página de Equipos.</p>
        <Button onClick={() => navigate("/teams")}>Ir a Mis Clanes</Button>
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
          <h1 className="text-2xl font-bold text-foreground">Solicitar ser Líder</h1>
          <p className="text-sm text-muted-foreground">Crea y lidera tu propio clan en BloodStrike</p>
        </div>
      </div>

      {hasPendingRequest ? (
        <div className="bg-card border border-amber-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Solicitud en revisión</h3>
          <p className="text-muted-foreground">
            Ya tienes una solicitud pendiente. Un administrador la revisará pronto.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Información del usuario */}
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
              onChange={(e) => set("clan_name", e.target.value)}
              placeholder="Ej: ShadowStrike"
              maxLength={50}
              className={clanExists ? "border-red-500 focus:border-red-500" : ""}
            />
            {clanExists && (
              <p className="text-red-500 text-xs mt-1">Este nombre de clan ya está en uso</p>
            )}
            {checkingClan && <p className="text-xs text-muted-foreground mt-1">Verificando...</p>}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Descripción del Clan (opcional)</label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="¿Cuál es el objetivo de tu clan? ¿Cómo te gustaría organizarlo?"
              rows={4}
              maxLength={500}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !form.clan_name.trim() || clanExists || checkingClan}
            className="w-full py-6 text-base"
          >
            {submitting ? "Enviando solicitud..." : "Enviar Solicitud de Liderazgo"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Un administrador revisará tu solicitud en las próximas horas.
          </p>
        </div>
      )}
    </div>
  );
}
