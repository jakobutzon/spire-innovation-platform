"use client";

import { useMemo, useState } from "react";
import { Lightbulb, Plus, XCircle } from "lucide-react";
import { Button, EmptyState, SectionHeader } from "@/components/ui";
import { IdeaCard } from "@/components/shared";
import { NyIdeModal } from "@/components/NyIdeModal";
import { useStore } from "@/lib/store";
import { erAaben } from "@/lib/data";
import { cn } from "@/lib/utils";

type Sortering = "nyeste" | "stemmer";

function sortIdeer<T extends { stemmer: number; oprettet: string }>(
  liste: T[],
  sortering: Sortering,
): T[] {
  return [...liste].sort((a, b) =>
    sortering === "stemmer"
      ? b.stemmer - a.stemmer
      : +new Date(b.oprettet) - +new Date(a.oprettet),
  );
}

export default function IdeerPage() {
  const { ideas, kategorier } = useStore();
  const [ideModal, setIdeModal] = useState(false);
  // filter: "alle" | kategori-id
  const [filter, setFilter] = useState<string>("alle");
  const [sortering, setSortering] = useState<Sortering>("nyeste");

  const filtre = useMemo(
    () => [
      { id: "alle", label: "Alle" },
      ...kategorier.map((k) => ({ id: k.id, label: k.navn })),
    ],
    [kategorier],
  );

  const vist = useMemo(() => {
    // Kun åbne idéer — dem lederen ikke har sendt til projekt eller afvist.
    let liste = ideas.filter(erAaben);
    if (filter !== "alle")
      liste = liste.filter((i) => i.kategoriId === filter);
    return sortIdeer(liste, sortering);
  }, [ideas, filter, sortering]);

  // Afviste idéer forsvinder ikke — de vises nedenfor med en tydelig markering,
  // og deres kommentarer/upvotes forbliver intakte.
  const afviste = useMemo(() => {
    let liste = ideas.filter((i) => i.status === "afvist");
    if (filter !== "alle")
      liste = liste.filter((i) => i.kategoriId === filter);
    return sortIdeer(liste, sortering);
  }, [ideas, filter, sortering]);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        titel="Idéer"
        beskrivelse="Tag stilling til hver idé — upvote dem, du tror på, eller spring over. Alt er offentligt, og de bedste idéer bliver til virkelighed."
        action={
          <Button onClick={() => setIdeModal(true)}>
            <Plus size={16} /> Ny idé
          </Button>
        }
      />

      <div
        data-tour="kategori-filtre"
        className="mb-5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap gap-1.5">
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

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sortér:</span>
          <select
            value={sortering}
            onChange={(e) => setSortering(e.target.value as Sortering)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-400"
          >
            <option value="nyeste">Nyeste</option>
            <option value="stemmer">Flest upvotes</option>
          </select>
        </div>
      </div>

      {vist.length === 0 && afviste.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={40} />}
          titel="Ingen idéer her endnu"
          tekst="Prøv et andet filter, eller vær den første til at indsende en idé."
        />
      ) : (
        <>
          {vist.length === 0 ? (
            <EmptyState
              icon={<Lightbulb size={40} />}
              titel="Ingen aktive idéer i dette filter"
              tekst="Prøv et andet filter, eller vær den første til at indsende en idé."
            />
          ) : (
            <div data-tour="ide-liste" className="space-y-4">
              {vist.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}

          {afviste.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <XCircle size={13} /> Afviste idéer · {afviste.length}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-4">
                {afviste.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <NyIdeModal open={ideModal} onClose={() => setIdeModal(false)} />
    </div>
  );
}
