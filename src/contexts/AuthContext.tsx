import { createContext, useContext, useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { Session, User } from "@supabase/supabase-js";
import {
  supabase,
  completeMagicLinkSignIn,
  isSupabaseConfigured,
  migrateFromLocalStorage,
} from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === "SIGNED_IN" && session?.user) {
          await migrateFromLocalStorage(session.user.id);
        }
      }
    );

    let appUrlOpenHandle: Awaited<ReturnType<typeof App.addListener>> | undefined;
    let removed = false;

    if (Capacitor.isNativePlatform()) {
      App.addListener("appUrlOpen", async ({ url }) => {
        if (!url.startsWith("goodsticks://auth")) return;
        try {
          await completeMagicLinkSignIn(url);
        } catch (err) {
          console.error("Magic-link sign-in failed:", err);
        }
      }).then((handle) => {
        if (removed) {
          void handle.remove();
        } else {
          appUrlOpenHandle = handle;
        }
      });
    }

    return () => {
      removed = true;
      subscription.unsubscribe();
      void appUrlOpenHandle?.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
