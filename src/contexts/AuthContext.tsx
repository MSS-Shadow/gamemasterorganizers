import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: string[];
  loading: boolean;
  isAdmin: boolean;
  isClanLeader: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  isAdmin: false,
  isClanLeader: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.warn("No se pudo cargar el perfil:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.warn("Error en fetchProfile:", err);
      setProfile(null);
    }
  };

  // Temporal: como no tienes tabla user_roles, asumimos roles básicos
  const fetchRoles = async (userId: string) => {
    try {
      // Por ahora solo verificamos si es el usuario administrador manualmente
      // Puedes cambiar "tu-email@ejemplo.com" por tu correo real
      const isAdminUser = user?.email === "portadormato.com"; // ← CAMBIA ESTO por tu correo

      setRoles(isAdminUser ? ["admin"] : []);
      console.log("Roles asignados:", isAdminUser ? ["admin"] : []);
    } catch (err) {
      console.warn("Error en fetchRoles:", err);
      setRoles([]);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchRoles(user.id)]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchRoles(session.user.id);
        }, 100);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    // Cargar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      roles,
      loading,
      isAdmin: roles.includes("admin"),
      isClanLeader: roles.includes("clan_leader"),
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
