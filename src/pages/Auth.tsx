import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [existingClans, setExistingClans] = useState<string[]>([]);
  const [selectedClan, setSelectedClan] = useState<string>("sin_clan");

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    playerId: "",
    platform: "Mobile" as "PC" | "Mobile",
    country: "Uruguay",
  });

  const navigate = useNavigate();

  // Cargar clanes existentes
  useEffect(() => {
    const loadClans = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("clan")
        .not("clan", "is", null)
        .not("clan", "eq", "");

      if (error) {
        console.error("Error cargando clanes:", error);
        return;
      }

      const clans = [...new Set((data || []).map((p: any) => p.clan))].sort() as string[];
      setExistingClans(clans);
    };

    loadClans();
  }, []);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Registro
  const handleSignup = async () => {
    if (!form.email || !form.password || !form.nickname || !form.playerId) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear perfil (sin clan por ahora)
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: form.email.trim(),
          nickname: form.nickname.trim(),
          player_id: form.playerId.trim(),
          platform: form.platform,
          country: form.country,
          clan: null,
        });

        if (profileError) throw profileError;

        // 3. Si eligió un clan existente → crear solicitud
        if (selectedClan !== "sin_clan" && selectedClan !== "") {
          const { error: requestError } = await supabase.from("clan_join_requests").insert({
            user_id: authData.user.id,
            nickname: form.nickname.trim(),
            player_id: form.playerId.trim(),
            clan_name: selectedClan,
            status: "pending",
          });

          if (requestError) {
            console.error("Error creando solicitud de clan:", requestError);
          } else {
            toast.success(`Solicitud enviada al líder del clan "${selectedClan}"`);
          }
        } else {
          toast.success("¡Registro exitoso! Revisa tu correo para confirmar la cuenta.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  // Login (simple)
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) throw error;

      toast.success("¡Inicio de sesión exitoso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <Trophy className="w-14 h-14 text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-1">Game Master Organizers</h1>
        <p className="text-center text-zinc-400 mb-8">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta de jugador"}
        </p>

        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          className="mb-3"
        />

        <Input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => updateForm("password", e.target.value)}
          className="mb-3"
        />

        {mode === "signup" && (
          <>
            <Input
              placeholder="Nickname"
              value={form.nickname}
              onChange={(e) => updateForm("nickname", e.target.value)}
              className="mb-3"
            />
            <Input
              placeholder="Player ID (BloodStrike)"
              value={form.playerId}
              onChange={(e) => updateForm("playerId", e.target.value)}
              className="mb-3"
            />

            <Select value={form.platform} onValueChange={(v) => updateForm("platform", v)}>
              <SelectTrigger className="mb-3">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="PC">PC</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="País"
              value={form.country}
              onChange={(e) => updateForm("country", e.target.value)}
              className="mb-3"
            />

            {/* Dropdown de Clanes */}
            <div className="mb-4">
              <label className="text-sm text-zinc-400 mb-1 block">Clan</label>
              <Select value={selectedClan} onValueChange={setSelectedClan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un clan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_clan">Sin clan (puedo unirme después)</SelectItem>
                  {existingClans.length > 0 && <div className="px-2 py-1 text-xs text-zinc-500">Clanes existentes:</div>}
                  {existingClans.map((clanName) => (
                    <SelectItem key={clanName} value={clanName}>
                      {clanName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">
                Si eliges un clan, se enviará una solicitud al líder.
              </p>
            </div>
          </>
        )}

        <Button 
          onClick={mode === "login" ? handleLogin : handleSignup} 
          disabled={loading}
          className="w-full mt-4"
        >
          {loading 
            ? "Procesando..." 
            : mode === "login" 
              ? "Iniciar Sesión" 
              : "Registrarse"}
        </Button>

        <p className="text-center text-sm text-zinc-400 mt-6">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} 
          <button 
            onClick={() => setMode(mode === "login" ? "signup" : "login")} 
            className="text-blue-400 hover:underline ml-1"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
