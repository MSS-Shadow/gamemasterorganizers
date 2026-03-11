import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Save, LogOut } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  nickname: z.string().trim().min(2).max(50),
  player_id: z.string().trim().min(2).max(50),
  platform: z.enum(["PC", "Mobile"]),
  country: z.string().trim().min(2).max(50),
  clan: z.string().trim().min(2).max(50),
});

export default function ProfilePage() {
  const { user, profile, roles, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: "", player_id: "", platform: "PC", country: "", clan: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm({ nickname: profile.nickname, player_id: profile.player_id, platform: profile.platform, country: profile.country, clan: profile.clan });
    }
  }, [profile]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const result = profileSchema.safeParse(form);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update(result.data).eq("user_id", user!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Perfil actualizado");
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;
  if (!profile) return <div className="text-center py-20 text-muted-foreground">Sin perfil encontrado.</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10"><User className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <div className="flex gap-2 mt-1">
            {roles.map((r) => <Badge key={r} variant="outline" className="text-xs capitalize">{r}</Badge>)}
            {profile.verified && <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">Verified</Badge>}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <Input value={profile.email} disabled className="mt-1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Nickname</label>
          <Input value={form.nickname} onChange={(e) => set("nickname", e.target.value)} maxLength={50} className="mt-1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Player ID</label>
          <Input value={form.player_id} onChange={(e) => set("player_id", e.target.value)} maxLength={50} className="mt-1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Platform</label>
          <Select value={form.platform} onValueChange={(v) => set("platform", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">País</label>
          <Input value={form.country} onChange={(e) => set("country", e.target.value)} maxLength={50} className="mt-1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Clan / Team Name</label>
          <Input value={form.clan} onChange={(e) => set("clan", e.target.value)} maxLength={50} className="mt-1" />
        </div>
        <div className="text-xs text-muted-foreground">Registrado: {new Date(profile.created_at).toLocaleDateString()}</div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" /> Guardar</Button>
          <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión</Button>
        </div>
      </div>
    </div>
  );
}
