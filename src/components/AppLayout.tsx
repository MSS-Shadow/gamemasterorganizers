import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Trophy, BarChart3, Users, User, Swords, CalendarDays,
  Medal, Star, TrendingUp, BookOpen, ScrollText, MessageCircle,
  Menu, X, ChevronRight, Shield, LogIn
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
  { label: "Historial", path: "/tournament-history", icon: Trophy },
  { label: "Salón de la Fama", path: "/hall-of-fame", icon: Star },
  { label: "Anuncios", path: "/announcements", icon: Megaphone },
  { label: "Creadores", path: "/creators", icon: TrendingUp },
  { label: "Actividad", path: "/activity", icon: BarChart3 },
  { label: "Reportar", path: "/report", icon: ScrollText },
  { label: "Reglas", path: "/rules", icon: ScrollText },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  const allNav = [
    ...navItems,
    ...(isAdmin ? [{ label: "Admin", path: "/admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-background fixed h-screen z-30">
        <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="font-rubik font-bold text-lg text-foreground tracking-tight">Game Master</span>
        </Link>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {allNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          {user ? (
            <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
              <User className="h-4 w-4 text-primary" />
              {profile?.nickname || "Mi Perfil"}
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          )}
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors">
            <MessageCircle className="h-4 w-4" />
            Únete al Discord
          </a>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-rubik font-bold text-foreground">Game Master</span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/profile" className="p-2 text-primary"><User className="h-5 w-5" /></Link>
            ) : (
              <Link to="/auth" className="p-2 text-primary"><LogIn className="h-5 w-5" /></Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-background/95 backdrop-blur lg:hidden pt-16">
            <nav className="p-4 space-y-1">
              {allNav.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    <span className="flex items-center gap-3"><item.icon className="h-4 w-4" />{item.label}</span>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
