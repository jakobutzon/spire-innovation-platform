"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Compass,
  Eye,
  Lightbulb,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { KategoriChip, UdfaldBadge } from "@/components/shared";
import { useStore } from "@/lib/store";
import { getUser } from "@/lib/data/users";
import { ANDET_ID } from "@/lib/data/kategorier";
import { initialer } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Visuel identitet der cykler pr. position — sidste stadie er altid "mål-linjen". */
const STADIE_PALETTE: {
  ikon: LucideIcon;
  ikonBoks: string;
  bjaelke: string;
  soejle: string;
}[] = [
  {
    ikon: ClipboardList,
    ikonBoks: "bg-slate-100 text-slate-600",
    bjaelke: "from-slate-400 to-slate-500",
    soejle: "bg-slate-50/60",
  },
  {
    ikon: Zap,
    ikonBoks: "bg-sky-100 text-sky-600",
    bjaelke: "from-sky-400 to-sky-500",
    soejle: "bg-sky-50/60",
  },
  {
    ikon: Eye,
    ikonBoks: "bg-amber-100 text-amber-600",
    bjaelke: "from-amber-400 to-amber-500",
    soejle: "bg-amber-50/60",
  },
  {
    ikon: Compass,
    ikonBoks: "bg-violet-100 text-violet-600",
    bjaelke: "from-violet-400 to-violet-500",
    soejle: "bg-violet-50/60",
  },
];

const SIDSTE_STADIE_STIL = {
  ikon: CheckCircle2,
  ikonBoks: "bg-emerald-100 text-emerald-600",
  bjaelke: "from-emerald-400 to-emerald-500",
  soejle: "bg-emerald-50/60",
};

export default function TeamsPage() {
  const { projects, ideas, kategorier, stadier, flytProjekt } = useStore();
  const [filter, setFilter] = useState<string>("alle");

  /** Navn på den medarbejder, hvis idé blev til projektet. */
  const idemager = (ideId?: string): string | undefined => {
    if (!ideId) return undefined;
    const idea = ideas.find((i) => i.id === ideId);
    return idea ? getUser(idea.forfatterId)?.navn : undefined;
  };

  /** Kategorien projektet hører under (via dets idé). */
  const projektKategori = (ideId?: string): string => {
    const idea = ideId ? ideas.find((i) => i.id === ideId) : undefined;
    return idea?.kategoriId ?? ANDET_ID;
  };

  const synligeProjekter =
    filter === "alle"
      ? projects
      : projects.filter((p) => projektKategori(p.ideId) === filter);

  const filtre = [
    { id: "alle", label: "Alle" },
    ...kategorier.map((k) => ({ id: k.id, label: k.navn })),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        titel="Projekter"
        beskrivelse="Når en idé er sendt videre, eksekverer et team på den — fra opgave til færdig. Innovationen er allerede besluttet; her handler det om at få den i mål."
      />

      {/* Kategori-filter over boardet */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {filtre.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Board */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(stadier.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {stadier.map((stadie, stadieIndex) => {
          const erSidste = stadieIndex === stadier.length - 1;
          const stil = erSidste
            ? SIDSTE_STADIE_STIL
            : STADIE_PALETTE[stadieIndex % STADIE_PALETTE.length];
          const iStadie = synligeProjekter.filter((p) => p.status === stadie.id);
          const StadieIkon = stil.ikon;
          const forrigeStadie = stadier[stadieIndex - 1]?.id;
          const naesteStadie = stadier[stadieIndex + 1]?.id;
          return (
            <div key={stadie.id} className="flex flex-col">
              {/* Kolonneheader */}
              <div className="mb-0 rounded-t-2xl bg-white px-3.5 pb-3 pt-3.5 shadow-sm ring-1 ring-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg",
                      stil.ikonBoks,
                    )}
                  >
                    <StadieIkon size={16} />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <h2 className="truncate text-sm font-semibold">
                      {stadie.navn}
                    </h2>
                    <p className="text-[11px] text-muted">
                      Trin {stadieIndex + 1} af {stadier.length}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {iStadie.length}
                  </span>
                </div>
              </div>
              <div
                className={cn("h-1 bg-gradient-to-r", stil.bjaelke)}
                aria-hidden
              />

              {/* Kolonnekrop */}
              <div
                className={cn(
                  "flex-1 space-y-3 rounded-b-2xl p-2.5 ring-1 ring-slate-200/60",
                  stil.soejle,
                )}
              >
                {iStadie.length === 0 && (
                  <div className="grid place-items-center gap-1.5 rounded-xl border border-dashed border-slate-300/70 px-3 py-8 text-center">
                    <StadieIkon size={20} className="text-slate-300" />
                    <p className="text-xs text-slate-400">
                      Ingen projekter i {stadie.navn.toLowerCase()}
                    </p>
                  </div>
                )}
                {iStadie.map((p) => {
                  const lead = getUser(p.leadId);
                  const forslagsstiller = idemager(p.ideId);
                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <Link href={`/teams/${p.id}`} className="block">
                        <KategoriChip kategoriId={projektKategori(p.ideId)} />
                        <p className="mt-2 font-semibold leading-snug group-hover:text-brand-700">
                          {p.navn}
                        </p>
                      </Link>

                      {erSidste && (
                        <div className="mt-2">
                          <UdfaldBadge udfald={p.udfald} />
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {p.medlemIds.slice(0, 4).map((mid) => {
                            const m = getUser(mid);
                            return (
                              <span
                                key={mid}
                                className={cn(
                                  "grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white",
                                  m?.avatarFarve ?? "bg-slate-400",
                                )}
                                title={m?.navn}
                              >
                                {initialer(m?.navn ?? "?")}
                              </span>
                            );
                          })}
                          {p.medlemIds.length > 4 && (
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 ring-2 ring-white">
                              +{p.medlemIds.length - 4}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted">
                          Lead:{" "}
                          <span className="font-medium text-slate-600">
                            {lead?.navn.split(" ")[0]}
                          </span>
                        </span>
                      </div>

                      {forslagsstiller && (
                        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-800">
                          <Lightbulb size={13} className="shrink-0 text-amber-500" />
                          <span className="truncate">
                            Idé af{" "}
                            <span className="font-semibold">
                              {forslagsstiller}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Flyt til nabo-stadie */}
                      <div className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3">
                        {forrigeStadie && (
                          <button
                            onClick={() => flytProjekt(p.id, forrigeStadie)}
                            className="flex-1 rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                          >
                            ← Tilbage
                          </button>
                        )}
                        {naesteStadie && (
                          <button
                            onClick={() => flytProjekt(p.id, naesteStadie)}
                            className="flex-1 rounded-lg bg-brand-50 px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                          >
                            Flyt frem →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
