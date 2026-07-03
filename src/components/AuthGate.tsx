"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

/**
 * Beskytter app-ruterne: kræver enten en Supabase-session eller gæste-mode.
 * Ellers redirect til /login. Client-side (matcher appens client-arkitektur);
 * gæste-bypass sikrer instant adgang for demoen.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { indlaeser, erGodkendt } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!indlaeser && !erGodkendt) router.replace("/login");
  }, [indlaeser, erGodkendt, router]);

  if (indlaeser || !erGodkendt) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-sm">
          <Sprout size={24} />
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
