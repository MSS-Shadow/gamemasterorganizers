import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  tournament: { id: string; name: string; mode: string };
}

export default function TournamentRegisterDialog({ open, onClose, tournament }: Props) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setTeamName(profile.clan);
  }, [profile]);

  if (!user || !profile) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Sesión</DialogTitle>
            <DialogDescription>Debes estar registrado para inscribirte en un torneo.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => { onClose(); navigate("/auth"); }}>Ir a Login</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const needsTeam = tournament.mode !== "Solo";

  const handleRegister = async () => {
    if (needsTeam && teamName.trim().length < 2) {
      toast.error("El nombre del equipo debe tener al menos 2 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("tournament_registrations").insert({
      tournament_id: tournament.id,
      user_id: user.id,
      nickname: profile.nickname,
      player_id: profile.player_id,
      platform: profile.platform,
      clan: profile.clan,
      tournament_team_name: needsTeam ? teamName.trim() : profile.nickname,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.error("Ya estás inscrito en este torneo");
      else toast.error(error.message);
      return;
    }
    toast.success("¡Inscripción exitosa!");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inscribirse: {tournament.name}</DialogTitle>
          <DialogDescription>Modo: {tournament.mode}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Nickname:</span> <span className="text-foreground font-medium">{profile.nickname}</span></div>
            <div><span className="text-muted-foreground">Player ID:</span> <span className="text-foreground font-medium">{profile.player_id}</span></div>
            <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground font-medium">{profile.platform}</span></div>
            <div><span className="text-muted-foreground">Clan:</span> <span className="text-foreground font-medium">{profile.clan}</span></div>
          </div>

          {needsTeam && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Team Name para este torneo</label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Ej: Titan Alpha" maxLength={50} />
              <p className="text-xs text-muted-foreground mt-1">Los jugadores con el mismo Team Name se agruparán automáticamente.</p>
            </div>
          )}
        </div>
        <Button onClick={handleRegister} disabled={loading} className="w-full mt-2">
          Confirmar Inscripción
        </Button>
      </DialogContent>
    </Dialog>
  );
}
