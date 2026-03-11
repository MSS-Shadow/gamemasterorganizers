import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const signupSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
  nickname: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  playerId: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  platform: z.enum(["PC", "Mobile"]),
  country: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  clan: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Requerido"),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nickname: "", playerId: "", platform: "PC", country: "", clan: "" });
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    const result = loginSchema.safeParse(form);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Bienvenido!");
    navigate("/");
  };

  const handleSignup = async () => {
    const result = signupSchema.safeParse(form);
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (authError) { setLoading(false); toast.error(authError.message); return; }
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        nickname: form.nickname,
        player_id: form.playerId,
        platform: form.platform,
        country: form.country,
        clan: form.clan,
        email: form.email,
      });
      if (profileError) { setLoading(false); toast.error(profileError.message); return; }
    }
    setLoading(false);
    toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <Trophy className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Game Master</h1>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          {mode === "login" ? "Inicia sesión en tu cuenta" : "Regístrate como jugador"}
        </p>

        <div className="space-y-3">
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
          <Input placeholder="Contraseña" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} maxLength={100} />

          {mode === "signup" && (
            <>
              <Input placeholder="Nickname (in-game)" value={form.nickname} onChange={(e) => set("nickname", e.target.value)} maxLength={50} />
              <Input placeholder="Player ID" value={form.playerId} onChange={(e) => set("playerId", e.target.value)} maxLength={50} />
              <Select value={form.platform} onValueChange={(v) => set("platform", v)}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="País" value={form.country} onChange={(e) => set("country", e.target.value)} maxLength={50} />
              <Input placeholder="Clan / Team Name" value={form.clan} onChange={(e) => set("clan", e.target.value)} maxLength={50} />
            </>
          )}
        </div>

        <Button className="w-full" disabled={loading} onClick={mode === "login" ? handleLogin : handleSignup}>
          {mode === "login" ? <><LogIn className="h-4 w-4 mr-2" /> Iniciar Sesión</> : <><UserPlus className="h-4 w-4 mr-2" /> Registrarse</>}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary hover:underline font-medium">
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
