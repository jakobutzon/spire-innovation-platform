"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  indhold: ReactNode;
}

export function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [aktiv, setAktiv] = useState(tabs[0]?.id);
  const aktivTab = tabs.find((t) => t.id === aktiv) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setAktiv(t.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              aktiv === t.id
                ? "bg-white text-ink shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5">{aktivTab?.indhold}</div>
    </div>
  );
}
