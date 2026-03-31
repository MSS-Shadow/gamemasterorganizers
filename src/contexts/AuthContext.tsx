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

  const fetchRoles = async (currentUser: User | null) => {
    if (!currentUser) {
      setRoles([]);
      return;
    }

    try {
      // Buscar roles en la tabla user_roles
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id);

      const userRoles = roleData?.map(r => r.role) || [];

      // Fallback: si el email es el tuyo, forzamos rol admin (por seguridad)
      if (currentUser.email === "portadormato@gmail.com") {
        if (!userRoles.includes("admin")) {
          userRoles.push("admin");
        }
      }

      setRoles(userRoles);
      console.log(`👤 Roles del usuario ${currentUser.email}:`, userRoles);
    } catch (err) {
      console.warn("Error al cargar roles:", err);
      
      // Fallback seguro: si es tu email, dar rol admin aunque falle la consulta
      if (currentUser.email === "portadormato@gmail.com") {
        setRoles(["admin"]);
      } else {
        setRoles([]);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchRoles(user)]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user)
        ]);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    // Cargar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user)
        ]);
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
