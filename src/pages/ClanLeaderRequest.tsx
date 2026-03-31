import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
  clan_name: z.string().trim().min(3).max(50),
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

  // ... (el resto del código de useEffect para verificar solicitud pendiente se mantiene igual)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return toast.error("Debes estar logueado");

    const result = requestSchema.safeParse(form);
    if (!result.success) return toast.error(result.error.errors[0].message);

    setSubmitting(true);

    let imageUrl = null;

    // Subir imagen si existe
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('clan-proofs')
        .upload(fileName, imageFile, { upsert: true });

      if (error) {
        toast.error("Error al subir la captura");
      } else {
        imageUrl = supabase.storage.from('clan-proofs').getPublicUrl(fileName).data.publicUrl;
      }
    }

    // Insertar la solicitud
    const { error } = await supabase.from("clan_leader_requests").insert({
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      clan_name: form.clan_name.trim(),
      email: profile.email,
      description: form.description.trim() || null,
      proof_image_url: imageUrl,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Solicitud enviada correctamente con la captura de prueba.");
      setHasPendingRequest(true);
    }
  };

  // ... (el resto del return se mantiene, pero agregamos el input de imagen)

  // En el formulario, agrega esto después del Textarea de descripción:

  <div>
    <label className="text-sm text-muted-foreground mb-1 block">Captura de pantalla (prueba de liderazgo)</label>
    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-zinc-950 hover:file:bg-yellow-300" />
    {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-48 rounded-lg" />}
  </div>
