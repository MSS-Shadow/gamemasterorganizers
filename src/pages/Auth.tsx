import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    const loadClans = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("clan")
        .not("clan", "is", null)
        .not("clan", "eq", "")
        .order("clan");

      if (error) return;
      const uniqueClans = [...new Set((data || []).map((p: any) => p.clan))].sort() as string[];
      setExistingClans(uniqueClans);
    };
    loadClans();
  }, []);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    if (!form.email || !form.password || !form.nickname || !form.playerId) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (selectedClan === "") {
      toast.error("Debes seleccionar un clan o 'Sin clan'");
      return;
    }

    setLoading(true);

    try {
      // Sign out any existing session before creating new account
      await supabase.auth.signOut();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: authData.user.id,
          email: form.email.trim().toLowerCase(),
          nickname: form.nickname.trim(),
          player_id: form.playerId.trim(),
          platform: form.platform,
          country: form.country,
          clan: selectedClan !== "sin_clan" ? selectedClan : "",
        });

        if (profileError) {
          console.error("Profile insert error:", profileError);
          toast.error("Error al crear perfil: " + profileError.message);
          return;
        }

        if (selectedClan !== "sin_clan") {
          await (supabase.from as any)("clan_join_requests").insert({
            user_id: authData.user.id,
            nickname: form.nickname.trim(),
            player_id: form.playerId.trim(),
            clan_name: selectedClan,
          });
          toast.success(`Solicitud enviada al clan "${selectedClan}"`);
        } else {
          toast.success("¡Cuenta creada! Revisa tu email.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (error) throw error;

      toast.success("¡Bienvenido!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-1">Game Master</h1>
        <p className="text-center text-zinc-400 mb-8">
          {mode === "login" ? "Inicia sesión para continuar" : "Únete a la comunidad"}
        </p>

        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          className="mb-3"
        />

        <div className="relative mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <Input
              placeholder="Nickname"
              value={form.nickname}
              onChange={(e) => updateForm("nickname", e.target.value)}
              className="mb-3"
            />
            <Input
              placeholder="Player ID"
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
              className="mb-4"
            />

            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-1.5 block">Clan</label>
              <Select value={selectedClan} onValueChange={setSelectedClan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un clan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_clan">Sin clan por ahora</SelectItem>
                  {existingClans.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-zinc-500">Clanes existentes:</div>
                      {existingClans.map((clan) => (
                        <SelectItem key={clan} value={clan}>
                          {clan}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={loading}
          className="w-full py-6 text-base font-semibold"
        >
          {loading ? "Procesando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </Button>

        {/* Enlace de olvidaste contraseña */}
        {mode === "login" && (
          <p className="text-center text-sm text-zinc-400 mt-4">
            <Link to="/auth/forgot-password" className="text-yellow-400 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        )}

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
