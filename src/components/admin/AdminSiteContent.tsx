import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Upload, Loader2 } from "lucide-react";

type Row = { id: string; key: string; value: string; type: string };

export default function AdminSiteContent() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("id,key,value,type")
        .order("key");
      if (error) throw error;
      setRows((data ?? []) as Row[]);
      const d: Record<string, string> = {};
      (data ?? []).forEach((r: any) => (d[r.key] = r.value ?? ""));
      setDrafts(d);
    } catch (err: any) {
      toast.error("Error cargando contenido: " + (err.message ?? "desconocido"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (row: Row) => {
    setSavingKey(row.key);
    try {
      const { error } = await supabase
        .from("site_content")
        .update({ value: drafts[row.key] ?? "" })
        .eq("id", row.id);
      if (error) throw error;
      toast.success(`"${row.key}" guardado`);
    } catch (err: any) {
      toast.error("Error al guardar: " + (err.message ?? "desconocido"));
    } finally {
      setSavingKey(null);
    }
  };

  const uploadImage = async (row: Row, file: File) => {
    setSavingKey(row.key);
    try {
      const nameParts = (file.name || "").split(".");
      const rawExt = nameParts.length > 1 ? nameParts.pop() : "";
      const ext = (rawExt || (file.type?.split("/")[1]) || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const safeKey = row.key.replace(/[^a-zA-Z0-9_-]/g, "_");
      const path = `site/${safeKey}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("uploads")
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type || undefined,
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      const url = data.publicUrl;
      setDrafts((d) => ({ ...d, [row.key]: url }));
      const { error } = await supabase.from("site_content").update({ value: url }).eq("id", row.id);
      if (error) throw error;
      toast.success("Imagen subida y guardada");
    } catch (err: any) {
      toast.error("Error subiendo imagen: " + (err.message ?? "desconocido"));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Cargando contenido...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Contenido del Sitio (CMS)</h2>
        <p className="text-sm text-muted-foreground">
          Editá textos, colores e imágenes de la página principal. Los cambios se reflejan al instante.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-primary">{row.key}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.type}</p>
              </div>
              <Button
                size="sm"
                onClick={() => save(row)}
                disabled={savingKey === row.key || drafts[row.key] === row.value}
                className="gap-2 shrink-0"
              >
                {savingKey === row.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </Button>
            </div>

            {row.type === "image_url" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {drafts[row.key] ? (
                    <img src={drafts[row.key]} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground text-xs">
                      Sin imagen
                    </div>
                  )}
                  <label className="cursor-pointer glass-card px-3 py-2 rounded-lg text-sm hover:border-primary/40 transition-colors inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(row, f);
                      }}
                    />
                  </label>
                </div>
                <Input
                  value={drafts[row.key] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            ) : row.type === "color" ? (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={drafts[row.key] || "#22c55e"}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                  className="h-10 w-16 rounded border border-border bg-background cursor-pointer"
                />
                <Input
                  value={drafts[row.key] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                  placeholder="#22c55e"
                />
              </div>
            ) : (drafts[row.key]?.length ?? 0) > 60 ? (
              <Textarea
                value={drafts[row.key] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                rows={3}
              />
            ) : (
              <Input
                value={drafts[row.key] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}