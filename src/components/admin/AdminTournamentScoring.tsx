import { useState, useEffect } from "react";
import { Calculator, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamResult {
  team_name: string;
  kills: number;
  position: number;
}

export default function AdminTournamentScoring() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [killValue, setKillValue] = useState(1);
  const [positionValues, setPositionValues] = useState<Record<string, number>>({
    "1": 15, "2": 12, "3": 10, "4": 8, "5": 6, "6": 5, "7": 4, "8": 3, "9": 2, "10": 1,
  });
  const [killMultipliers, setKillMultipliers] = useState<Record<string, number>>({
    "1": 2.0, "2": 1.5, "3": 1.3, "4": 1.2, "5": 1.1,
  });
  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("tournaments").select("*").order("date", { ascending: false }).then(({ data }) => {
      setTournaments(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    const load = async () => {
      // Load existing config
      const { data: config } = await supabase.from("tournament_scoring_config").select("*").eq("tournament_id", selectedTournament).maybeSingle();
      if (config) {
        setKillValue(Number((config as any).kill_value));
        setPositionValues((config as any).position_values as any || positionValues);
        setKillMultipliers((config as any).kill_multiplier_by_position as any || killMultipliers);
      }
      // Load existing results
      const { data: res } = await supabase.from("tournament_results").select("*").eq("tournament_id", selectedTournament).order("total_points", { ascending: false });
      setResults((res as any[]) ?? []);
      // Load registered teams
      const { data: regs } = await supabase.from("tournament_registrations").select("tournament_team_name, nickname").eq("tournament_id", selectedTournament);
      const tournament = tournaments.find((t) => t.id === selectedTournament);
      const isSolo = tournament?.mode === "Solo";
      const teamNames = isSolo
        ? [...new Set(regs?.map((r: any) => r.nickname))]
        : [...new Set(regs?.map((r: any) => r.tournament_team_name))];
      // Initialize teams if no results
      if (!(res as any[])?.length && teamNames.length > 0) {
        setTeams(teamNames.map((name) => ({ team_name: name, kills: 0, position: 0 })));
      } else if ((res as any[])?.length) {
        setTeams((res as any[]).map((r: any) => ({ team_name: r.team_name, kills: r.kills, position: r.position })));
      }
    };
    load();
  }, [selectedTournament, tournaments]);

  const saveConfig = async () => {
    if (!selectedTournament) return;
    const { error } = await supabase.from("tournament_scoring_config").upsert({
      tournament_id: selectedTournament,
      kill_value: killValue,
      position_values: positionValues,
      kill_multiplier_by_position: killMultipliers,
    }, { onConflict: "tournament_id" });
    if (error) toast.error(error.message);
    else toast.success("Configuración guardada");
  };

  const calculatePoints = (team: TeamResult) => {
    const posPoints = positionValues[String(team.position)] || 0;
    const multiplier = killMultipliers[String(team.position)] || 1;
    const kPoints = team.kills * killValue;
    const mBonus = kPoints * (multiplier - 1);
    return { kill_points: kPoints, position_points: posPoints, multiplier_bonus: mBonus, total_points: posPoints + kPoints + mBonus };
  };

  const publishResults = async () => {
    if (!selectedTournament || teams.length === 0) return;
    setSaving(true);
    // Delete old results
    await supabase.from("tournament_results").delete().eq("tournament_id", selectedTournament);
    // Save config first
    await saveConfig();
    // Calculate and insert results
    const rows = teams.map((t) => {
      const pts = calculatePoints(t);
      return {
        tournament_id: selectedTournament,
        team_name: t.team_name,
        kills: t.kills,
        position: t.position,
        kill_points: pts.kill_points,
        position_points: pts.position_points,
        multiplier_bonus: pts.multiplier_bonus,
        total_points: pts.total_points,
      };
    });
    const { error } = await supabase.from("tournament_results").insert(rows);
    if (error) { toast.error(error.message); setSaving(false); return; }

    // Record champion
    const sorted = [...rows].sort((a, b) => b.total_points - a.total_points);
    if (sorted[0]) {
      const tournament = tournaments.find((t) => t.id === selectedTournament);
      await supabase.from("tournament_champions").upsert({
        tournament_id: selectedTournament,
        team_name: sorted[0].team_name,
        mode: tournament?.mode || "Solo",
        tournament_name: tournament?.name || "",
        date: tournament?.date || new Date().toISOString(),
      }, { onConflict: "tournament_id" });
      await supabase.from("tournaments").update({ status: "Finished" }).eq("id", selectedTournament);
    }

    setSaving(false);
    toast.success("Resultados publicados");
    const { data: updated } = await supabase.from("tournament_results").select("*").eq("tournament_id", selectedTournament).order("total_points", { ascending: false });
    setResults((updated as any[]) ?? []);
  };

  const updateTeam = (idx: number, field: keyof TeamResult, value: any) => {
    setTeams((prev) => prev.map((t, i) => i === idx ? { ...t, [field]: Number(value) || 0 } : t));
  };

  const addTeam = () => setTeams([...teams, { team_name: "", kills: 0, position: teams.length + 1 }]);
  const removeTeam = (idx: number) => setTeams(teams.filter((_, i) => i !== idx));

  if (loading) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sistema de Puntuación</h2>

      <Select value={selectedTournament} onValueChange={setSelectedTournament}>
        <SelectTrigger className="w-full sm:w-[300px]"><SelectValue placeholder="Seleccionar Torneo" /></SelectTrigger>
        <SelectContent>
          {tournaments.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.mode})</SelectItem>)}
        </SelectContent>
      </Select>

      {selectedTournament && (
        <>
          {/* Scoring Config */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Configuración de Puntos</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Valor por Kill</label>
                <Input type="number" value={killValue} onChange={(e) => setKillValue(Number(e.target.value))} min={0} step={0.5} />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Puntos por Posición</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i}>
                    <span className="text-xs text-muted-foreground block text-center mb-1">#{i + 1}</span>
                    <Input type="number" className="text-center text-sm h-9" value={positionValues[String(i + 1)] || 0}
                      onChange={(e) => setPositionValues({ ...positionValues, [String(i + 1)]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Multiplicador de Kill por Posición</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i}>
                    <span className="text-xs text-muted-foreground block text-center mb-1">#{i + 1}</span>
                    <Input type="number" className="text-center text-sm h-9" step={0.1} value={killMultipliers[String(i + 1)] || 1}
                      onChange={(e) => setKillMultipliers({ ...killMultipliers, [String(i + 1)]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={saveConfig}><Save className="h-4 w-4 mr-1" /> Guardar Config</Button>
          </div>

          {/* Team Scores Input */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Resultados de Equipos</h3>
              <Button variant="outline" size="sm" onClick={addTeam}><Plus className="h-4 w-4 mr-1" /> Agregar</Button>
            </div>

            {teams.length > 0 ? (
              <div className="border border-border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="w-20">Kills</TableHead>
                      <TableHead className="w-20">Posición</TableHead>
                      <TableHead className="w-24 text-right">Pts Kill</TableHead>
                      <TableHead className="w-24 text-right">Pts Pos</TableHead>
                      <TableHead className="w-24 text-right">Bonus</TableHead>
                      <TableHead className="w-24 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((t, i) => {
                      const pts = calculatePoints(t);
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            <Input value={t.team_name} onChange={(e) => {
                              const updated = [...teams];
                              updated[i] = { ...updated[i], team_name: e.target.value };
                              setTeams(updated);
                            }} className="h-8 text-sm" />
                          </TableCell>
                          <TableCell><Input type="number" value={t.kills} onChange={(e) => updateTeam(i, "kills", e.target.value)} className="h-8 text-sm w-16" /></TableCell>
                          <TableCell><Input type="number" value={t.position} onChange={(e) => updateTeam(i, "position", e.target.value)} className="h-8 text-sm w-16" /></TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{pts.kill_points.toFixed(1)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{pts.position_points.toFixed(1)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{pts.multiplier_bonus.toFixed(1)}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-foreground">{pts.total_points.toFixed(1)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTeam(i)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay equipos. Inscribe equipos al torneo o agrega manualmente.</p>
            )}

            <Button onClick={publishResults} disabled={saving || teams.length === 0} className="w-full">
              {saving ? "Publicando..." : "Publicar Resultados"}
            </Button>
          </div>

          {/* Published Results */}
          {results.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-foreground mb-3">Resultados Publicados</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="text-right">Kills</TableHead>
                      <TableHead className="text-right">Pts Kill</TableHead>
                      <TableHead className="text-right">Pts Pos</TableHead>
                      <TableHead className="text-right">Bonus</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r: any, i: number) => (
                      <TableRow key={r.id} className={i === 0 ? "bg-primary/5" : ""}>
                        <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{r.team_name}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{r.kills}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.kill_points).toFixed(1)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.position_points).toFixed(1)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{Number(r.multiplier_bonus).toFixed(1)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-foreground">{Number(r.total_points).toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
