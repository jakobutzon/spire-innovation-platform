"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabase, harSupabaseConfig } from "@/lib/supabase/client";

const GAEST_KEY = "spire.gaest";

interface AuthState {
  /** Indlæser fortsat den første session? (Undgår redirect-flimmer.) */
  indlaeser: boolean;
  session: Session | null;
  bruger: SupabaseUser | null;
  /** Er brugeren i gæste-mode (demo uden konto)? */
  gaest: boolean;
  /** Har appen en Supabase-konfiguration overhovedet? */
  harKonfig: boolean;
  /** Adgang til appen: rigtig session ELLER gæste-mode. */
  erGodkendt: boolean;

  signUp: (
    email: string,
    password: string,
    visningsnavn?: string,
  ) => Promise<{ fejl?: string; bekraeftMail?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ fejl?: string }>;
  signOut: () => Promise<void>;
  skiftAdgangskode: (nyKode: string) => Promise<{ fejl?: string }>;
  startGaest: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const harKonfig = harSupabaseConfig();
  const [indlaeser, setIndlaeser] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [gaest, setGaest] = useState(false);

  useEffect(() => {
    // Gæste-flag fra localStorage.
    try {
      setGaest(window.localStorage.getItem(GAEST_KEY) === "1");
    } catch {
      // ignorér
    }

    const supabase = getSupabase();
    if (!supabase) {
      setIndlaeser(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIndlaeser(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(
    async (email, password, visningsnavn) => {
      const supabase = getSupabase();
      if (!supabase) return { fejl: "Supabase er ikke konfigureret." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: visningsnavn
          ? { data: { visningsnavn } }
          : undefined,
      });
      if (error) return { fejl: error.message };
      // Hvis mailbekræftelse er slået til, findes der ingen session endnu.
      return { bekraeftMail: !data.session };
    },
    [],
  );

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) return { fejl: "Supabase er ikke konfigureret." };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { fejl: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    try {
      window.localStorage.removeItem(GAEST_KEY);
    } catch {
      // ignorér
    }
    setGaest(false);
    setSession(null);
  }, []);

  const skiftAdgangskode = useCallback<AuthState["skiftAdgangskode"]>(
    async (nyKode) => {
      const supabase = getSupabase();
      if (!supabase) return { fejl: "Supabase er ikke konfigureret." };
      const { error } = await supabase.auth.updateUser({ password: nyKode });
      if (error) return { fejl: error.message };
      return {};
    },
    [],
  );

  const startGaest = useCallback(() => {
    try {
      window.localStorage.setItem(GAEST_KEY, "1");
    } catch {
      // ignorér
    }
    setGaest(true);
  }, []);

  const value: AuthState = {
    indlaeser,
    session,
    bruger: session?.user ?? null,
    gaest,
    harKonfig,
    erGodkendt: Boolean(session) || gaest,
    signUp,
    signIn,
    signOut,
    skiftAdgangskode,
    startGaest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth skal bruges inden i en AuthProvider");
  return ctx;
}
