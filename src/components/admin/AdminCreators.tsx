import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminCreators() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Ya no hacemos consulta real

  // No hacemos ninguna consulta a la tabla que no existe
  useEffect(() => {
    // Simplemente mostramos estado vacío
    setRequests([]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Creadores de Contenido</h2>
        <Badge variant="outline">En desarrollo</Badge>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
        <h3 className="text-xl font-medium mb-3">Gestión de Creadores</h3>
        <p className="text-zinc-400 max-w-md mx-auto">
          Esta sección estará disponible pronto.<br />
          Cuando los usuarios soliciten ser creadores, podrás revisarlos y aprobarlos aquí.
        </p>
      </div>

      <div className="text-xs text-zinc-500 text-center">
        Tabla <code>creator_requests</code> aún no creada
      </div>
    </div>
  );
}
