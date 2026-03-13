import { useState, useEffect } from "react";
import { Swords, ExternalLink, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Scrim {
  id: string;
  title: string;
  mode: string;
  date: string;
  stream_link: string | null;
  status: string;
  max_players: number;
  creator_nickname: string;
  created_by: string;
  participantCount: number;
}

export default function ScrimsPage() {
  const { user, profile, roles } = useAuth();
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", mode: "Squad", date: "", stream_link: "" });
  const [creating, setCreating] = useState(false);

  const canCreate = roles.includes("admin") || roles.includes("content_creator");

  const fetchScrims = async () => {
    setLoading(true);
    const { data: scrimsData } = await supabase.from("scrims").select("*").order("date", { ascending: false });
    const { data: participants } = await supabase.from("scrim_participants").select("scrim_id");
    
    if (scrimsData) {
      const counts: Record<string, number> = {};
      participants?.forEach((p: any) => { counts[p.scrim_id] = (counts[p.scrim_id] || 0) + 1; });
      
      setScrims(scrimsData.map((s: any) => ({
        ...s,
        participantCount: counts[s.id] || 0,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchScrims(); }, []);

  const joinScrim = async (scrimId: string) => {
    if (!user || !profile) { toast.error("Debes iniciar sesión para unirte"); return; }
    const profileStatus = (profile as any).status;
    if (profileStatus === "suspended" || profileStatus === "banned") {
      toast.error("Tu cuenta está restringida y no puedes unirte a scrims");
      return;
    }
    const { error } = await supabase.from("scrim_participants").insert({
      scrim_id: scrimId,
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      team: profile.clan,
      platform: profile.platform,
    });
    if (error) {
      if (error.code === "23505") toast.error("Ya estás inscrito en este scrim");
      else toast.error(error.message);
      return;
    }
    toast.success("¡Te uniste al scrim!");
    fetchScrims();
  };

  const createScrim = async () => {
    if (!form.title || !form.date) { toast.error("Título y fecha son obligatorios"); return; }
    setCreating(true);
    const { error } = await supabase.from("scrims").insert({
      title: form.title,
      mode: form.mode,
      date: new Date(form.date).toISOString(),
      stream_link: form.stream_link || null,
      created_by: user!.id,
      creator_nickname: profile!.nickname,
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Scrim creado");
    setShowCreate(false);
    setForm({ title: "", mode: "Squad", date: "", stream_link: "" });
    fetchScrims();
  };

  const now = new Date();
  const live = scrims.filter((s) => s.status === "live");
  const upcoming = scrims.filter((s) => s.status === "upcoming" && new Date(s.date) > now);
  const history = scrims.filter((s) => s.status === "completed" || (s.status !== "live" && new Date(s.date) <= now));

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Scrims</h1>
          <p className="text-muted-foreground">Partidas de práctica organizadas por creadores y admins.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Crear Scrim
          </Button>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Scrims en Vivo</h2>
        {live.length > 0 ? (
          <div className="space-y-3">
            {live.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Swords className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">por {s.creator_nickname} · {s.mode}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">EN VIVO</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(s.date).toLocaleDateString("es")}</span>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">{s.participantCount} jugadores</span>
                    {s.stream_link && (
                      <a href={s.stream_link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Ver
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay scrims en vivo en este momento.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Próximos Scrims</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Swords className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">por {s.creator_nickname} · {s.mode}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(s.date).toLocaleDateString("es")} · {new Date(s.date).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="tabular-nums">{s.participantCount} jugadores</span>
                </div>
                <Button onClick={() => joinScrim(s.id)} className="mt-3" size="sm">
                  Unirse al Scrim
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay scrims programados.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">Historial de Scrims</h2>
        {history.length > 0 ? (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {history.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground">por {s.creator_nickname} · {s.mode}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{new Date(s.date).toLocaleDateString("es")}</p>
                  <p className="tabular-nums">{s.participantCount} jugadores</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay historial de scrims aún.</p>
        )}
      </section>

      {/* Create Scrim Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Scrim</DialogTitle>
            <DialogDescription>Configura los detalles del scrim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Título</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Scrim Nocturno #1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Modo</label>
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Duo">Duo</SelectItem>
                  <SelectItem value="Trio">Trio</SelectItem>
                  <SelectItem value="Squad">Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Fecha y Hora</label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Link del Stream (opcional)</label>
              <Input value={form.stream_link} onChange={(e) => setForm({ ...form, stream_link: e.target.value })} placeholder="https://twitch.tv/..." />
            </div>
          </div>
          <Button onClick={createScrim} disabled={creating} className="w-full mt-2">
            {creating ? "Creando..." : "Crear Scrim"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
