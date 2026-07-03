"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Columns3,
  Lightbulb,
  Lock,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Pill,
  SectionHeader,
} from "@/components/ui";
import { kanStyre, useStore } from "@/lib/store";
import { ANDET_ID, KATEGORI_FARVER } from "@/lib/data/kategorier";
import { cn } from "@/lib/utils";

export default function IndstillingerPage() {
  const { rolle } = useStore();

  if (!kanStyre(rolle)) {
    return (
      <div className="animate-fade-in">
        <SectionHeader titel="Indstillinger" />
        <EmptyState
          icon={<Lock size={40} />}
          titel="Indstillinger er for ledere"
          tekst="Her styrer ledere kategorier og stadier for hele platformen. Skift til rollen Leder i toppen — eller gå tilbage og bidrag med en idé."
        />
        <div className="mt-5 flex justify-center">
          <Link href="/">
            <Button variant="secondary">
              <Lightbulb size={16} /> Del din mening
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        titel="Indstillinger"
        beskrivelse="Styr de emner og trin, der bruges på tværs af platformen — kategorier til idéer og stadier på projekt-boardet."
      />

      <KategoriAdminSektion />
      <StadierAdminSektion />
    </div>
  );
}

/** Leder-admin af kategorier: omdøb inline, tilføj nye, slet (undtagen "Andet"). */
function KategoriAdminSektion() {
  const {
    kategorier,
    tilfoejKategori,
    redigerKategori,
    saetKategoriFarve,
    sletKategori,
    flytKategori,
  } = useStore();
  const [nyt, setNyt] = useState("");

  const felt =
    "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="mb-1 flex items-center gap-2">
          <Tag size={18} className="text-brand-600" />
          <h2 className="font-semibold">Kategorier</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          De emner, medarbejdere kan vælge, når de deler en idé. Omdøb direkte,
          tilføj nye, eller slet dem du ikke bruger. &quot;Andet&quot; er fast.
        </p>

        <div className="space-y-2">
          {kategorier.map((k, i) => {
            const erAndet = k.id === ANDET_ID;
            return (
              <div key={k.id} className="flex items-center gap-3">
                <FarveVaelger
                  valgt={k.chipFarve}
                  onVaelg={(farve) => saetKategoriFarve(k.id, farve)}
                />
                <input
                  className={felt}
                  value={k.navn}
                  onChange={(e) => redigerKategori(k.id, e.target.value)}
                />
                {erAndet ? (
                  <Pill tone="slate">Fast</Pill>
                ) : (
                  <>
                    <OpNedKnapper
                      opDisabled={i === 0}
                      nedDisabled={
                        i === kategorier.length - 1 ||
                        kategorier[i + 1]?.id === ANDET_ID
                      }
                      onOp={() => flytKategori(k.id, "op")}
                      onNed={() => flytKategori(k.id, "ned")}
                      navn={k.navn}
                    />
                    <button
                      onClick={() => sletKategori(k.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Slet kategorien ${k.navn}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            tilfoejKategori(nyt);
            setNyt("");
          }}
          className="mt-4 flex gap-2 border-t border-slate-100 pt-4"
        >
          <input
            className={felt}
            placeholder="Tilføj en ny kategori…"
            value={nyt}
            onChange={(e) => setNyt(e.target.value)}
          />
          <Button type="submit" disabled={!nyt.trim()}>
            <Plus size={15} /> Tilføj
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

/** Leder-admin af stadier på eksekverings-boardet: omdøb, tilføj, slet. */
function StadierAdminSektion() {
  const { stadier, tilfoejStadie, redigerStadie, sletStadie, flytStadie } =
    useStore();
  const [nyt, setNyt] = useState("");

  const felt =
    "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
  const kanSlette = stadier.length > 2;

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="mb-1 flex items-center gap-2">
          <Columns3 size={18} className="text-brand-600" />
          <h2 className="font-semibold">Stadier</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Trinene på projekt-boardet. Omdøb direkte, tilføj flere, eller slet
          dem du ikke bruger. Det sidste trin er altid mål-linjen, hvor et
          projekt får sit udfald.
        </p>

        <div className="space-y-2">
          {stadier.map((s, i) => {
            const erSidste = i === stadier.length - 1;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-center text-xs font-medium text-slate-400">
                  {i + 1}
                </span>
                <input
                  className={felt}
                  value={s.navn}
                  onChange={(e) => redigerStadie(s.id, e.target.value)}
                />
                {erSidste && <Pill tone="green">Mål</Pill>}
                <OpNedKnapper
                  opDisabled={i === 0}
                  nedDisabled={i === stadier.length - 1}
                  onOp={() => flytStadie(s.id, "op")}
                  onNed={() => flytStadie(s.id, "ned")}
                  navn={s.navn}
                />
                {kanSlette ? (
                  <button
                    onClick={() => sletStadie(s.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Slet stadiet ${s.navn}`}
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center" />
                )}
              </div>
            );
          })}
        </div>
        {!kanSlette && (
          <p className="mt-2 text-xs text-muted">
            Mindst 2 stadier skal blive på boardet.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            tilfoejStadie(nyt);
            setNyt("");
          }}
          className="mt-4 flex gap-2 border-t border-slate-100 pt-4"
        >
          <input
            className={felt}
            placeholder="Tilføj et nyt stadie…"
            value={nyt}
            onChange={(e) => setNyt(e.target.value)}
          />
          <Button type="submit" disabled={!nyt.trim()}>
            <Plus size={15} /> Tilføj
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

/**
 * To pile (op/ned) stablet i én boks — i alt samme størrelse som
 * skraldespandsikonet ved siden af. Flytter rækken et trin i listen.
 */
function OpNedKnapper({
  opDisabled,
  nedDisabled,
  onOp,
  onNed,
  navn,
}: {
  opDisabled: boolean;
  nedDisabled: boolean;
  onOp: () => void;
  onNed: () => void;
  navn: string;
}) {
  return (
    <div className="flex h-8 w-8 shrink-0 flex-col overflow-hidden rounded-lg ring-1 ring-slate-200">
      <button
        type="button"
        onClick={onOp}
        disabled={opDisabled}
        className="flex h-4 flex-1 items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={`Flyt ${navn} op`}
      >
        <ChevronUp size={12} />
      </button>
      <button
        type="button"
        onClick={onNed}
        disabled={nedDisabled}
        className="flex h-4 flex-1 items-center justify-center border-t border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label={`Flyt ${navn} ned`}
      >
        <ChevronDown size={12} />
      </button>
    </div>
  );
}

/** Klikbar farveprik der åbner en lille palet til at vælge kategoriens farve. */
function FarveVaelger({
  valgt,
  onVaelg,
}: {
  valgt: string;
  onVaelg: (farve: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-5 w-5 rounded-full ring-1 ring-slate-300 transition hover:ring-slate-400",
          valgt,
        )}
        aria-label="Vælg kategori-farve"
        title="Vælg farve"
      />
      {open && (
        <div className="absolute left-0 top-7 z-40 grid grid-cols-6 gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {KATEGORI_FARVER.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                onVaelg(f);
                setOpen(false);
              }}
              className={cn(
                "h-6 w-6 rounded-full ring-1 ring-slate-200 transition hover:scale-110",
                f,
                valgt === f && "ring-2 ring-brand-500 ring-offset-1",
              )}
              aria-label={`Vælg farve ${f}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
