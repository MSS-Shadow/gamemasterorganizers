import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function AdminRoleManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación para evitar crashes
    setTimeout(() => {
      setUsers([]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="p-12 text-center">Cargando roles...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Roles</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
        <p className="text-zinc-400">Gestión de roles en desarrollo</p>
        <p className="text-sm text-zinc-500 mt-4">Tu usuario ya tiene rol de admin configurado.</p>
      </div>
    </div>
  );
}
