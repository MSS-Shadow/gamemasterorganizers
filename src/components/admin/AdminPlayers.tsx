import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function AdminPlayers() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Jugadores Registrados</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
        <p className="text-zinc-400">Lista de jugadores se cargará cuando la tabla esté lista.</p>
      </div>
    </div>
  );
}
