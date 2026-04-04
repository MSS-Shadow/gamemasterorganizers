import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteText, setDeleteText] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setAnnouncements((data as any[]) ?? []);
    } catch (err: any) {
      console.error("Error loading announcements:", err);
      toast.error("Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const createAnnouncement = async () => {
    if (!form.title || !form.description) { toast.error("Título y descripción son obligatorios"); return; }
    setCreating(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `announcements/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, imageFile);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase.from("announcements").insert({
      title: form.title,
      description: form.description,
      image_url: imageUrl,
      created_by: user!.id,
    });

    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Anuncio creado");
    setShowCreate(false);
    setForm({ title: "", description: "" });
    setImageFile(null);
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    if (deleteText !== "DELETE") { toast.error("Escribe DELETE para confirmar"); return; }
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Anuncio eliminado");
    setDeleteConfirm(null);
    setDeleteText("");
    fetchAnnouncements();
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Anuncios</h2>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Crear Anuncio</Button>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString("es")}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setDeleteConfirm(a.id); setDeleteText(""); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No hay anuncios.</p>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crear Anuncio</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título del anuncio" />
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción..." rows={4} />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Imagen (opcional)</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button onClick={createAnnouncement} disabled={creating} className="w-full mt-2">
            {creating ? "Creando..." : "Publicar Anuncio"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Confirmar Eliminación</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Escribe <span className="font-mono font-bold text-foreground">DELETE</span> para confirmar.</p>
          <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE" />
          <Button variant="destructive" onClick={() => deleteConfirm && deleteAnnouncement(deleteConfirm)} disabled={deleteText !== "DELETE"} className="w-full">
            Eliminar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
