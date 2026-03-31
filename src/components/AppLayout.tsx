import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Trophy, BarChart3, Users, User, Swords, CalendarDays,
  Medal, Star, Megaphone, Shield, LogIn, Menu, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Inicio", path: "/", icon: Home },
  { label: "Torneos", path: "/tournaments", icon: Trophy },
  { label: "Rankings", path: "/rankings", icon: BarChart3 },
  { label: "Equipos", path: "/teams", icon: Users },
  { label: "Jugadores", path: "/players", icon: User },
  { label: "Scrims", path: "/scrims", icon: Swords },
  { label: "Próximos", path: "/upcoming", icon: CalendarDays },
  { label: "Resultados", path: "/results", icon: Medal },
  { label: "Salón de la Fama", path: "/hall-of-fame", icon: Star },
  { label: "Anuncios", path: "/announcements", icon: Megaphone },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  const allNav = [
    ...navItems,
    ...(isAdmin ? [{ label: "Admin", path: "/admin", icon: Shield }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900 fixed h-screen z-30">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
          <div className="p-2 bg-yellow-400 rounded-xl">
            <Trophy className="h-7 w-7 text-zinc-950" />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-tighter text-white">Game Master</span>
            <p className="text-[10px] text-zinc-500 -mt-1">BLOODSTRIKE</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {allNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-yellow-400 text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{profile?.nickname || "Jugador"}</p>
                <p className="text-xs text-zinc-500">Ver perfil</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 transition-colors text-zinc-950 font-semibold py-3 rounded-xl"
            >
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-400 rounded-lg">
              <Trophy className="h-6 w-6 text-zinc-950" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Game Master</span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white hover:bg-zinc-800 rounded-lg"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-zinc-950 pt-16 lg:hidden overflow-y-auto"
          >
            <nav className="p-4 space-y-2">
              {allNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-yellow-400 text-zinc-950"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
