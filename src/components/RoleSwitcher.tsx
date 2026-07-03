"use client";

import { kanStyre, useStore } from "@/lib/store";
import type { Rolle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, UserCog } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ROLLER: { id: Rolle; navn: string; beskrivelse: string }[] = [
  { id: "medarbejder", navn: "Medarbejder", beskrivelse: "Indsend og stem på idéer" },
  { id: "leder", navn: "Leder", beskrivelse: "Vurder, prioritér og styr portefølje" },
  { id: "admin", navn: "Administrator", beskrivelse: "Fuld adgang og opsætning" },
];

export function RoleSwitcher() {
  const { rolle, saetRolle } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const aktiv = ROLLER.find((r) => r.id === rolle)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
      >
        <UserCog size={16} className="text-brand-600" />
        <span className="hidden sm:inline">Vises som:</span>
        <span>{aktiv.navn}</span>
        <ChevronDown size={15} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 animate-fade-in rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Skift demorolle
          </p>
          {ROLLER.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                saetRolle(r.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50",
                rolle === r.id && "bg-brand-50/60",
              )}
            >
              <span className="mt-0.5">
                {rolle === r.id ? (
                  <Check size={16} className="text-brand-600" />
                ) : (
                  <span className="block h-4 w-4" />
                )}
              </span>
              <span>
                <span className="block text-sm font-medium">{r.navn}</span>
                <span className="block text-xs text-muted">{r.beskrivelse}</span>
              </span>
            </button>
          ))}
          <p className="px-3 py-2 text-[11px] leading-snug text-slate-400">
            {kanStyre(rolle)
              ? "Du kan beslutte idéer (send til projekt/afvis) og styre kategorier."
              : "Du kan indsende idéer, stemme og give feedback."}
          </p>
        </div>
      )}
    </div>
  );
}
