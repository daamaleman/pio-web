import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { readClaims } from "@/lib/claims";
import { queryClient } from "./queryClient";
import { AuthContext, type AuthValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = still checking; null = no session
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // Do not call supabase inside this callback: only store the session.
    const { data } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const claims = session ? readClaims(session.access_token) : null;
    return {
      loading: session === undefined,
      session: session ?? null,
      claims,
      role: claims?.app_role ?? null,
      signOut: async () => {
        await supabase.auth.signOut();
        queryClient.clear(); // nothing from the previous user stays cached
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
