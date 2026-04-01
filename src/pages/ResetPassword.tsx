import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Limpiar cualquier lock pendiente al montar y desmontar
  useEffect(() => {
    return () => {
      // Forzar liberación de locks de Supabase
      supabase.auth.stop();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    if (password.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("¡Contraseña actualizada correctamente!");

        // Esperar un poco para que el toast se vea
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 1500);
      }
    } catch (err: any) {
      toast.error("Error inesperado: " + (err.message || "Inténtalo de nuevo"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8">
        <Link to="/auth" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
          <ArrowLeft className="h-5 w-5" /> Volver al login
        </Link>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-400/10 rounded-2xl">
            <Lock className="h-10 w-10 text-yellow-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Nueva contraseña</h1>
        <p className="text-center text-zinc-400 mb-8">
          Ingresa y confirma tu nueva contraseña
        </p>

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

          <Button 
            type="submit" 
            className="w-full py-6 text-base font-semibold" 
            disabled={loading}
          >
            {loading ? "Actualizando contraseña..." : "Cambiar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
