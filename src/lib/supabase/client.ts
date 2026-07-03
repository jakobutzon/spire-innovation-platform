import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let klient: SupabaseClient | null = null;

/**
 * Singleton browser-Supabase-klient. Returnerer null hvis env-variabler mangler,
 * så appen (og gæste-mode) stadig virker uden en Supabase-opsætning.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!klient) {
    klient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return klient;
}

/** Er Supabase konfigureret? (Bruges til at skjule konto-funktioner i gæste-mode.) */
export function harSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
