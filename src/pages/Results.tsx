import { useState, useEffect } from "react";
import { Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Will load completed tournaments with results when bracket system is implemented
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Resultados</h1>
        <p className="text-muted-foreground">Resultados finales de torneos completados.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8">
        <p className="text-center text-muted-foreground">Aún no hay resultados de torneos. Los resultados aparecerán aquí cuando se completen los primeros torneos.</p>
      </div>
    </div>
  );
}
