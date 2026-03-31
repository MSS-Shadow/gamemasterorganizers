import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) return toast.error("Las contraseñas no coinciden");
    if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.");
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Nueva contraseña</h1>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Repetir nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
