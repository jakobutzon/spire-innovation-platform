"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NiveauBar } from "@/components/NiveauBar";

export function Topbar() {
  const { currentUser, niveau } = useStore();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-canvas/80 px-4 py-3 backdrop-blur sm:px-6">
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Søg efter idéer, projekter, kolleger…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
        <RoleSwitcher />

        <Link
          href="/min-profil"
          className="flex items-center gap-2.5 rounded-xl px-1 py-0.5 transition-colors hover:bg-slate-100"
          title="Gå til Min profil"
        >
          <Avatar
            navn={currentUser.navn}
            farve={currentUser.avatarFarve}
            billedeUrl={currentUser.avatarUrl}
            niveau={niveau}
          />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{currentUser.navn}</p>
            <p className="text-xs text-muted">{currentUser.titel}</p>
          </div>
        </Link>
        <NiveauBar className="hidden sm:flex" />
      </div>
    </header>
  );
}
