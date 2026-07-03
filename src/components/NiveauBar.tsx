"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { OPGAVER_PR_NIVEAU } from "@/lib/niveau";
import { cn } from "@/lib/utils";

/**
 * Niveau-label + fremgangsbar til toppen. Viser instant feedback ("+1") ved
 * hver fuldført opgave, og fejrer synligt når man stiger niveau.
 */
export function NiveauBar({ className }: { className?: string }) {
  const { niveau, niveauFremgang, fremgang } = useStore();
  const [vis, setVis] = useState(false);
  const [erSteg, setErSteg] = useState(false);

  useEffect(() => {
    if (fremgang.nonce === 0) return;
    setErSteg(fremgang.niveauSteg);
    setVis(true);
    const t = setTimeout(() => setVis(false), fremgang.niveauSteg ? 2200 : 1300);
    return () => clearTimeout(t);
  }, [fremgang.nonce, fremgang.niveauSteg]);

  const procent = (niveauFremgang / OPGAVER_PR_NIVEAU) * 100;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
        Niveau {niveau}
      </span>
      <div className="relative">
        <div
          className={cn(
            "h-2.5 w-24 overflow-hidden rounded-full bg-slate-200 ring-1 ring-inset ring-slate-300/60 transition-shadow",
            erSteg && vis && "animate-niveau-glow",
          )}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
            style={{ width: `${procent}%` }}
          />
        </div>
        {vis && (
          <span
            key={fremgang.nonce}
            className={cn(
              "animate-niveau-op-pop pointer-events-none absolute -right-1 -top-5 whitespace-nowrap text-xs font-bold",
              erSteg ? "text-amber-500" : "text-emerald-500",
            )}
          >
            {erSteg ? (
              <span className="inline-flex items-center gap-0.5">
                <Sparkles size={11} /> Niveau op!
              </span>
            ) : (
              "+1"
            )}
          </span>
        )}
      </div>
    </div>
  );
}
