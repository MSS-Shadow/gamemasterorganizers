import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  clan_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  description: z.string().trim().max(500).optional(),
});

export default function ClanLeaderRequest() {
  const { user, profile, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ clan_name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  useEffect(() => {
    if (user) {
      supabase.from("clan_leader_requests").select("id").eq("user_id", user.id).eq("status", "pending").then(({ data }) => {
        setHasRequest((data?.length ?? 0) > 0);
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) setForm((f) => ({ ...f, clan_name: profile.clan || "" }));
  }, [profile]);

  const handleSubmit = async () => {
    if (!user || !profile) return;
    const result = requestSchema.safeParse(form);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }

    setSubmitting(true);
    const { error } = await supabase.from("clan_leader_requests").insert({
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      clan_name: form.clan_name.trim(),
      email: profile.email,
      description: form.description.trim() || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Solicitud enviada. Un administrador la revisará pronto.");
    setHasRequest(true);
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  if (roles.includes("clan_leader")) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Ya eres Líder de Clan</h1>
        <p className="text-muted-foreground">Puedes gestionar tu clan desde la página de equipos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitar Líder de Clan</h1>
          <p className="text-sm text-muted-foreground">Solicita ser líder de un clan para gestionar sus miembros.</p>
        </div>
      </div>

      {hasRequest ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-primary font-medium">Solicitud enviada — pendiente de revisión por un administrador.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Nickname</label>
            <Input value={profile?.nickname ?? ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Player ID</label>
            <Input value={profile?.player_id ?? ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <Input value={profile?.email ?? ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Nombre del Clan</label>
            <Input value={form.clan_name} onChange={(e) => setForm({ ...form, clan_name: e.target.value })} maxLength={50} placeholder="Mi Clan" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Descripción (opcional)</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} placeholder="¿Por qué quieres liderar este clan?" rows={3} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </div>
      )}
    </div>
  );
}
