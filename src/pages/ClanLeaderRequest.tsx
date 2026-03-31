import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, AlertCircle, Upload, Image } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        return toast.error("La imagen no debe superar los 5MB");
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return toast.error("Debes estar logueado");

    const result = requestSchema.safeParse(form);
    if (!result.success) return toast.error(result.error.errors[0].message);

    if (!imageFile) return toast.error("Debes subir una captura de pantalla como prueba");

    setSubmitting(true);
    setUploading(true);

    let proofImageUrl = null;

    try {
      // Subir imagen a Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `clan-proof-${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('clan-proofs')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      proofImageUrl = supabase.storage.from('clan-proofs').getPublicUrl(fileName).data.publicUrl;

      // Guardar la solicitud con la imagen
      const { error } = await supabase.from("clan_leader_requests").insert({
        user_id: user.id,
        nickname: profile.nickname,
        player_id: profile.player_id,
        clan_name: form.clan_name.trim(),
        email: profile.email,
        description: form.description.trim() || null,
        proof_image_url: proofImageUrl,
        status: "pending",
      });

      if (error) throw error;

      toast.success("✅ Solicitud enviada con la captura de prueba. Un administrador la revisará.");
      setHasPendingRequest(true);
      setForm({ clan_name: "", description: "" });
      setImageFile(null);
      setPreviewUrl(null);

    } catch (error: any) {
      toast.error(error.message || "Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Cargando...</div>;

  if (roles.includes("clan_leader")) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Users className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ya eres líder de clan</h1>
        <Button onClick={() => navigate("/teams")}>Ir a mis clanes</Button>
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
          <p className="text-sm text-muted-foreground">Debes subir una captura que demuestre que eres líder en el juego</p>
        </div>
      </div>

      {hasPendingRequest ? (
        <div className="bg-card border border-amber-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Solicitud en revisión</h3>
          <p className="text-muted-foreground">Ya tienes una solicitud pendiente. Te notificaremos cuando sea revisada.</p>
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
              onChange={(e) => setForm({ ...form, clan_name: e.target.value })}
              placeholder="Ej: Shadow Legion"
              maxLength={50}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Descripción (opcional)</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="¿Por qué quieres liderar este clan?"
              rows={3}
            />
          </div>

          {/* Subida de captura */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Captura de pantalla (prueba de liderazgo) *
            </label>
            <div className="border border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-yellow-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="proof-image"
              />
              <label htmlFor="proof-image" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-400">Haz clic para subir captura</p>
                <p className="text-xs text-zinc-500 mt-1">PNG, JPG o JPEG • Máx 5MB</p>
              </label>
            </div>
            {previewUrl && (
              <div className="mt-4">
                <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg border border-zinc-700" />
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || uploading || !form.clan_name.trim() || !imageFile}
            className="w-full py-6 text-base"
          >
            {submitting || uploading ? "Enviando solicitud..." : "Enviar Solicitud con Captura"}
          </Button>
        </div>
      )}
    </div>
  );
}
