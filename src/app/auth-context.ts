import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Claims } from "@/lib/claims";
import type { AppRole } from "@/lib/roles";

export type AuthValue = {
  loading: boolean;
  session: Session | null;
  claims: Claims | null;
  role: AppRole | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
