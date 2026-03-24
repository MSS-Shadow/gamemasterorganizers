import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSiteConfig() {
  const [prizes, setPrizes] = useState("$500+ USD en premios");
  const [staffCount, setStaffCount] = useState("5");
  const [discord, setDiscord] = useState("https://discord.gg");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_config").select("*");
      (data ?? []).forEach((row: any) => {
        if (row.key === "hero_stats") {
          setPrizes(row.value.prizes_delivered || "");
          setStaffCount(String(row.value.staff_members || "5"));
        }
        if (row.key === "discord_link") {
          setDiscord(typeof row.value === "string" ? row.value : "https://discord.gg");
        }
      });
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const updates = [
      supabase.from("site_config").upsert({ key: "hero_stats", value: { prizes_delivered: prizes, staff_members: Number(staffCount) }, updated_at: new Date().toISOString() }, { onConflict: "key" }),
      supabase.from("site_config").upsert({ key: "discord_link", value: discord, updated_at: new Date().toISOString() }, { onConflict: "key" }),
    ];
    const results = await Promise.all(updates);
    setSaving(false);
    if (results.some((r) => r.error)) {
      toast.error("Error al guardar configuración");
    } else {
      toast.success("Configuración guardada");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Configuración del Sitio</h2>
      <p className="text-sm text-muted-foreground">Estos valores se muestran en la página principal.</p>

      <div className="grid gap-4 max-w-lg">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Premios Entregados (texto)</label>
          <Input value={prizes} onChange={(e) => setPrizes(e.target.value)} placeholder="$500+ USD en premios" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Miembros del Staff</label>
          <Input type="number" value={staffCount} onChange={(e) => setStaffCount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Link de Discord</label>
          <Input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="https://discord.gg/..." />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="gap-2">
        <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </div>
  );
}
