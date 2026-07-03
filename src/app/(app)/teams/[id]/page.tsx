"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  MessageSquare,
  Plus,
  Send,
  Square,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button, Card, CardBody, Pill } from "@/components/ui";
import { KategoriChip, ProjektStatusPill, UdfaldBadge } from "@/components/shared";
import { useStore } from "@/lib/store";
import { getUser } from "@/lib/data/users";
import { cn, datoKort, initialer, relativDato } from "@/lib/utils";

export default function ProjektDetaljePage() {
  const params = useParams<{ id: string }>();
  const {
    getProject,
    ideas,
    stadier,
    flytProjekt,
    saetProjektUdfald,
    currentUser,
    tilfoejOpgave,
    skiftOpgave,
    sletOpgave,
    tilfoejProjektKommentar,
    sletProjektKommentar,
  } = useStore();
  const [nyOpgave, setNyOpgave] = useState("");
  const [nyKommentar, setNyKommentar] = useState("");

  const projekt = getProject(params.id);
  if (!projekt) return notFound();

  const kildeIde = projekt.ideId
    ? ideas.find((i) => i.id === projekt.ideId)
    : undefined;
  const idemager = kildeIde ? getUser(kildeIde.forfatterId) : undefined;
  const erPaaMaalLinjen = stadier[stadier.length - 1]?.id === projekt.status;
  const faerdigeOpgaver = projekt.opgaver.filter((o) => o.faerdig).length;

  function sendOpgave(e: React.FormEvent) {
    e.preventDefault();
    if (!nyOpgave.trim()) return;
    tilfoejOpgave(projekt!.id, nyOpgave.trim());
    setNyOpgave("");
  }

  function sendKommentar(e: React.FormEvent) {
    e.preventDefault();
    if (!nyKommentar.trim()) return;
    tilfoejProjektKommentar(projekt!.id, nyKommentar.trim());
    setNyKommentar("");
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/teams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-700"
      >
        <ArrowLeft size={15} /> Tilbage til projekter
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjektStatusPill status={projekt.status} />
            {erPaaMaalLinjen && <UdfaldBadge udfald={projekt.udfald} />}
            {kildeIde && <KategoriChip kategoriId={kildeIde.kategoriId} />}
            <span className="text-xs text-muted">
              Startet {datoKort(projekt.startet)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {projekt.navn}
          </h1>
          <p className="mt-1.5 max-w-2xl text-muted">{projekt.beskrivelse}</p>
          {idemager && kildeIde && (
            <Link
              href={`/ideer/${kildeIde.id}`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100"
            >
              <Lightbulb size={14} /> Idé foreslået af {idemager.navn}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Opgaveliste (to-do) */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm">
                  <ListChecks size={16} />
                </span>
                <h3 className="font-semibold">Opgaver</h3>
              </div>
              {projekt.opgaver.length > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  {faerdigeOpgaver}/{projekt.opgaver.length} færdige
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {projekt.opgaver.length === 0 && (
                <p className="py-2 text-sm text-muted">
                  Ingen opgaver endnu — tilføj den første herunder.
                </p>
              )}
              {projekt.opgaver.map((o) => (
                <div
                  key={o.id}
                  className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-slate-50"
                >
                  <button
                    onClick={() => skiftOpgave(projekt.id, o.id)}
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                      o.faerdig
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 text-transparent hover:border-brand-400",
                    )}
                    aria-label={o.faerdig ? "Markér som ikke færdig" : "Markér som færdig"}
                  >
                    {o.faerdig ? <CheckCircle2 size={13} /> : <Square size={12} className="opacity-0" />}
                  </button>
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-sm",
                      o.faerdig ? "text-slate-400 line-through" : "text-slate-700",
                    )}
                  >
                    {o.tekst}
                  </span>
                  <button
                    onClick={() => sletOpgave(projekt.id, o.id)}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-300 opacity-0 transition-all hover:bg-white hover:text-rose-500 group-hover:opacity-100"
                    aria-label="Slet opgave"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={sendOpgave} className="mt-3 flex gap-2">
              <input
                value={nyOpgave}
                onChange={(e) => setNyOpgave(e.target.value)}
                placeholder="Tilføj en opgave…"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button type="submit" variant="secondary" disabled={!nyOpgave.trim()}>
                <Plus size={15} /> Tilføj
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Kommentarer / arbejdstråd */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
                <MessageSquare size={16} />
              </span>
              <h3 className="font-semibold">
                Kommentarer{" "}
                <span className="text-sm font-normal text-muted">
                  ({projekt.kommentarer.length})
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              {projekt.kommentarer.length === 0 && (
                <p className="py-2 text-sm text-muted">
                  Ingen kommentarer endnu — start dialogen om projektet.
                </p>
              )}
              {[...projekt.kommentarer]
                .sort((a, b) => +new Date(a.oprettet) - +new Date(b.oprettet))
                .map((k) => {
                  const u = getUser(k.forfatterId);
                  const egen = k.forfatterId === currentUser.id;
                  return (
                    <div key={k.id} className="flex gap-2.5">
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white",
                          u?.avatarFarve ?? "bg-slate-400",
                        )}
                      >
                        {initialer(u?.navn ?? "?")}
                      </span>
                      <div className="group min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{u?.navn}</span>
                          <span className="text-xs text-muted">
                            {relativDato(k.oprettet)}
                          </span>
                          {egen && (
                            <button
                              onClick={() =>
                                sletProjektKommentar(projekt.id, k.id)
                              }
                              className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-300 opacity-0 transition-all hover:bg-white hover:text-rose-500 group-hover:opacity-100"
                              aria-label="Slet kommentar"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-slate-700">{k.tekst}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <form onSubmit={sendKommentar} className="mt-3 flex gap-2">
              <input
                value={nyKommentar}
                onChange={(e) => setNyKommentar(e.target.value)}
                placeholder="Skriv en kommentar…"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button type="submit" variant="secondary" disabled={!nyKommentar.trim()}>
                <Send size={14} /> Send
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Flyt projektet gennem eksekverings-boardet */}
      <Card className="mt-7">
        <CardBody>
          <h2 className="mb-3 font-semibold">Fremgang</h2>
          <div className="flex flex-wrap gap-1.5">
            {stadier.map((s) => (
              <button
                key={s.id}
                onClick={() => flytProjekt(projekt.id, s.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors",
                  projekt.status === s.id
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                )}
              >
                {s.navn}
              </button>
            ))}
          </div>

          {erPaaMaalLinjen && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Lykkedes det?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => saetProjektUdfald(projekt.id, "succesfuld")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors",
                    projekt.udfald === "succesfuld"
                      ? "bg-emerald-600 text-white ring-emerald-600"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-emerald-50",
                  )}
                >
                  <CheckCircle2 size={15} /> Succesfuld
                </button>
                <button
                  onClick={() => saetProjektUdfald(projekt.id, "ikke-succesfuld")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors",
                    projekt.udfald === "ikke-succesfuld"
                      ? "bg-rose-600 text-white ring-rose-600"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-rose-50",
                  )}
                >
                  <XCircle size={15} /> Ikke succesfuld
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Team & credit */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-3 font-semibold">Team</h3>
            <div className="space-y-3">
              {projekt.medlemIds.map((mid) => {
                const m = getUser(mid);
                return (
                  <div key={mid} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white",
                        m?.avatarFarve ?? "bg-slate-400",
                      )}
                    >
                      {initialer(m?.navn ?? "?")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{m?.navn}</p>
                      <p className="text-xs text-muted">{m?.titel}</p>
                    </div>
                    {mid === projekt.leadId && <Pill tone="brand">Lead</Pill>}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="mb-3 font-semibold">Idéens ophav</h3>
            {idemager && kildeIde ? (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-white",
                      idemager.avatarFarve,
                    )}
                  >
                    {initialer(idemager.navn)}
                  </span>
                  <div>
                    <p className="font-medium">{idemager.navn}</p>
                    <p className="text-xs text-muted">
                      {idemager.titel} · {idemager.afdeling}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Dette projekt udspringer af {idemager.navn.split(" ")[0]}s
                  idé. Krediten følger med hele vejen — fra forslag til
                  eksekvering.
                </p>
                <Link
                  href={`/ideer/${kildeIde.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
                >
                  <Lightbulb size={15} /> Se den oprindelige idé
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted">
                Dette projekt er ikke knyttet til en enkelt idé.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
