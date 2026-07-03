"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowBigUp,
  Check,
  MessageSquare,
  RotateCcw,
  Send,
  SkipForward,
  X,
} from "lucide-react";
import { Button, Card, CardBody, Pill } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { STATUS_LABELS } from "@/lib/data";
import { getUser } from "@/lib/data/users";
import { useStore } from "@/lib/store";
import { CheckCircle2, XCircle } from "lucide-react";
import type {
  Idea,
  IdeStatus,
  Kommentar,
  ProjektUdfald,
} from "@/lib/types";
import { cn, relativDato } from "@/lib/utils";

/* ---------------- Top-kommentar ---------------- */
/**
 * Vælg den kommentar der skal fremhæves. En afvisningsbegrundelse vinder
 * altid — ellers mest upvotet, dernæst nyeste.
 */
export function topKommentar(kommentarer: Kommentar[]): Kommentar | undefined {
  if (kommentarer.length === 0) return undefined;
  const begrundelse = kommentarer.find((k) => k.erBegrundelse);
  if (begrundelse) return begrundelse;
  return [...kommentarer].sort(
    (a, b) =>
      b.stemmer - a.stemmer ||
      +new Date(b.oprettet) - +new Date(a.oprettet),
  )[0];
}

/** Kompakt visning af den mest relevante kommentar på et idé-kort. */
export function TopKommentar({ kommentarer }: { kommentarer: Kommentar[] }) {
  const top = topKommentar(kommentarer);
  if (!top) return null;
  const u = getUser(top.forfatterId);
  const erBegrundelse = top.erBegrundelse;
  return (
    <div
      className={cn(
        "mt-3 flex items-start gap-2.5 rounded-xl px-3 py-2",
        erBegrundelse ? "bg-rose-50" : "bg-slate-50",
      )}
    >
      <MessageSquare
        size={14}
        className={cn("mt-0.5 shrink-0", erBegrundelse ? "text-rose-400" : "text-slate-400")}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">
          {erBegrundelse ? (
            <span className="font-medium text-rose-700">Begrundelse for afvisning</span>
          ) : (
            <span className="font-medium text-slate-600">{u?.navn}</span>
          )}
          {" · "}
          {erBegrundelse && u?.navn ? `${u.navn} · ` : ""}
          {relativDato(top.oprettet)}
        </p>
        <p className="line-clamp-2 text-sm text-slate-700">{top.tekst}</p>
      </div>
      {!erBegrundelse && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
          <ArrowBigUp size={13} /> {top.stemmer}
        </span>
      )}
    </div>
  );
}

/* ---------------- Inline kommentarfelt ---------------- */
/** Kompakt kommentarfelt så man kan give feedback uden at åbne idéen. */
export function InlineKommentarForm({ ideaId }: { ideaId: string }) {
  const { tilfoejKommentar } = useStore();
  const [tekst, setTekst] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!tekst.trim()) return;
    tilfoejKommentar(ideaId, tekst.trim());
    setTekst("");
  }

  return (
    <form onSubmit={send} className="mt-3 flex gap-2">
      <input
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Giv konstruktiv feedback…"
        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      <Button type="submit" variant="secondary" disabled={!tekst.trim()}>
        <Send size={14} /> Send
      </Button>
    </form>
  );
}

/* ---------------- Afvis-modal ---------------- */
/**
 * Lederen skal altid begrunde en afvisning. Idéen forsvinder ikke — den
 * flyttes til "Afviste idéer", og begrundelsen bliver den fremhævede
 * kommentar på idéen (jf. topKommentar).
 */
export function AfvisIdeModal({
  idea,
  onClose,
}: {
  idea: { id: string; titel: string } | null;
  onClose: () => void;
}) {
  const { afvisIde } = useStore();
  const [begrundelse, setBegrundelse] = useState("");

  function luk() {
    setBegrundelse("");
    onClose();
  }

  function bekraeft(e: React.FormEvent) {
    e.preventDefault();
    if (!idea || !begrundelse.trim()) return;
    afvisIde(idea.id, begrundelse.trim());
    luk();
  }

  return (
    <Modal open={!!idea} onClose={luk} titel="Afvis idé">
      <form onSubmit={bekraeft} className="space-y-4">
        {idea && (
          <p className="text-sm text-muted">
            Du afviser «
            <span className="font-medium text-slate-700">{idea.titel}</span>
            ». Idéen forsvinder ikke — den flyttes til de afviste idéer under
            Idéer, og din begrundelse vises som den fremhævede kommentar.
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Begrundelse</label>
          <textarea
            className="min-h-24 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Forklar kort hvorfor idéen afvises…"
            value={begrundelse}
            onChange={(e) => setBegrundelse(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={luk}>
            Annullér
          </Button>
          <Button type="submit" variant="danger" disabled={!begrundelse.trim()}>
            <X size={15} /> Afvis idé
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- FremdriftsRing ---------------- */
/** Kompakt fremdriftsring (SVG-donut) — bruges på projektkort og fremdriftstællere. */
export function FremdriftsRing({
  vaerdi,
  ringFarve = "stroke-brand-500",
}: {
  vaerdi: number;
  ringFarve?: string;
}) {
  const r = 15.5;
  const omkreds = 2 * Math.PI * r;
  const fyldt = (Math.min(100, Math.max(0, vaerdi)) / 100) * omkreds;
  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          className="stroke-slate-100"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${fyldt} ${omkreds}`}
          className={cn("transition-all duration-500", ringFarve)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-slate-600">
        {Math.round(vaerdi)}%
      </span>
    </div>
  );
}

/* ---------------- KategoriChip ---------------- */
/** Farvekodet boks der viser hvilken kategori en idé hører under. */
export function KategoriChip({ kategoriId }: { kategoriId?: string }) {
  const { getKategori } = useStore();
  const kategori = kategoriId ? getKategori(kategoriId) : undefined;
  const farve = kategori ? kategori.chipFarve : "bg-slate-100 text-slate-600";
  const label = kategori ? kategori.navn : "Andet";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        farve,
      )}
    >
      {label}
    </span>
  );
}

/* ---------------- StatusPill (kun leder-visning) ---------------- */
const STATUS_TONE: Record<
  IdeStatus,
  "brand" | "slate" | "green" | "amber" | "rose" | "violet" | "sky"
> = {
  ny: "sky",
  "under-vurdering": "amber",
  godkendt: "green",
  afvist: "rose",
  "i-projekt": "violet",
};

export function StatusPill({ status }: { status: IdeStatus }) {
  return <Pill tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Pill>;
}

/* ---------------- Projektstatus (eksekverings-board) ---------------- */
/**
 * Viser navnet på et projekts stadie. Stadier er leder-redigerbare, så
 * navn og tone slås op dynamisk — det sidste stadie i rækkefølgen (mål-linjen)
 * får altid grøn tone, uanset hvad lederen har navngivet det.
 */
export function ProjektStatusPill({ status }: { status: string }) {
  const { stadier, getStadie } = useStore();
  const stadie = getStadie(status);
  const erSidsteStadie = stadier[stadier.length - 1]?.id === status;
  return (
    <Pill tone={erSidsteStadie ? "green" : "slate"}>
      {stadie?.navn ?? status}
    </Pill>
  );
}

/** Viser om et færdigt projekt lykkedes eller ej. */
export function UdfaldBadge({ udfald }: { udfald?: ProjektUdfald }) {
  if (!udfald) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        Udfald ikke sat
      </span>
    );
  }
  if (udfald === "succesfuld") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={12} /> Succesfuld
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
      <XCircle size={12} /> Ikke succesfuld
    </span>
  );
}

/* ---------------- Upvote / spring-over-knapper ---------------- */
export function BeslutningsKnapper({
  ideId,
  layout = "kort",
}: {
  ideId: string;
  layout?: "kort" | "stor";
}) {
  const { stem, springOver, harStemt, harSprunget } = useStore();
  const stemt = harStemt(ideId);
  const sprunget = harSprunget(ideId);

  if (layout === "stor") {
    // Store, tydelige knapper til Overblik-køen
    return (
      <div className="flex gap-2">
        <button
          onClick={() => stem(ideId)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            stemt
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100",
          )}
        >
          <ArrowBigUp size={18} className={stemt ? "fill-white" : ""} />
          {stemt ? "Upvotet" : "Upvote"}
        </button>
        <button
          onClick={() => springOver(ideId)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            sprunget
              ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200",
          )}
        >
          {sprunget ? <RotateCcw size={16} /> : <SkipForward size={16} />}
          {sprunget ? "Sprunget over" : "Spring over"}
        </button>
      </div>
    );
  }

  // Kompakt: lodret upvote-boks + lille spring-over/fortryd under
  return (
    <div className="flex w-14 flex-col items-center gap-1.5">
      <button
        onClick={(e) => {
          e.preventDefault();
          stem(ideId);
        }}
        className={cn(
          "flex w-full flex-col items-center rounded-xl border px-2 py-1.5 transition-colors",
          stemt
            ? "border-brand-300 bg-brand-50 text-brand-700"
            : "border-slate-200 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50",
        )}
        aria-label="Upvote idé"
      >
        <ArrowBigUp size={18} className={stemt ? "fill-brand-500" : ""} />
        <span className="text-sm font-semibold">
          <IdeStemmer ideId={ideId} />
        </span>
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          springOver(ideId);
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-medium transition-colors",
          sprunget
            ? "text-slate-500 hover:text-slate-700"
            : "text-slate-400 hover:text-slate-600",
        )}
        aria-label={sprunget ? "Fortryd spring over" : "Spring over"}
      >
        {sprunget ? <RotateCcw size={11} /> : <SkipForward size={11} />}
        {sprunget ? "Fortryd" : "Spring"}
      </button>
    </div>
  );
}

function IdeStemmer({ ideId }: { ideId: string }) {
  const { ideas } = useStore();
  return <>{ideas.find((i) => i.id === ideId)?.stemmer ?? 0}</>;
}

/* ---------------- BeslutningsMarkør ---------------- */
export function BeslutningsMarkoer({ ideId }: { ideId: string }) {
  const { harStemt, harSprunget } = useStore();
  if (harStemt(ideId))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <Check size={12} /> Upvotet
      </span>
    );
  if (harSprunget(ideId))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        <SkipForward size={12} /> Sprunget over
      </span>
    );
  return null;
}

/* ---------------- IdeaCard ---------------- */
export function IdeaCard({ idea }: { idea: Idea }) {
  const forfatter = getUser(idea.forfatterId);
  const afvist = idea.status === "afvist";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        afvist
          ? "opacity-75 ring-1 ring-rose-100"
          : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200",
      )}
    >
      <CardBody className="flex gap-4">
        {afvist ? (
          <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-rose-500">
            <XCircle size={18} />
            <span className="text-[10px] font-semibold">Afvist</span>
          </div>
        ) : (
          <BeslutningsKnapper ideId={idea.id} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <KategoriChip kategoriId={idea.kategoriId} />
            {afvist ? (
              <Pill tone="rose">Afvist</Pill>
            ) : (
              <BeslutningsMarkoer ideId={idea.id} />
            )}
            <span className="text-xs text-muted">{relativDato(idea.oprettet)}</span>
          </div>
          <Link href={`/ideer/${idea.id}`} className="group">
            <h3
              className={cn(
                "mt-1.5 font-semibold leading-snug",
                afvist ? "text-slate-500" : "group-hover:text-brand-700",
              )}
            >
              {idea.titel}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {idea.beskrivelse}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <span>
              af{" "}
              <span className="font-medium text-slate-600">{forfatter?.navn}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={13} /> {idea.kommentarer.length}
            </span>
          </div>
          <TopKommentar kommentarer={idea.kommentarer} />
          {!afvist && <InlineKommentarForm ideaId={idea.id} />}
        </div>
      </CardBody>
    </Card>
  );
}
