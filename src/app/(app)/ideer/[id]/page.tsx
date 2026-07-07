"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  ArrowBigUp,
  ArrowLeft,
  Pencil,
  Rocket,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import {
  BeslutningsKnapper,
  BeslutningsMarkoer,
  KategoriChip,
} from "@/components/shared";
import { kanStyre, useStore } from "@/lib/store";
import { getUser } from "@/lib/data/users";
import { cn, datoKort, initialer, relativDato } from "@/lib/utils";

const FELT =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export default function IdeDetaljePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    ideas,
    rolle,
    currentUser,
    tilfoejKommentar,
    stemKommentar,
    harStemtKommentar,
    redigerIde,
    sletIde,
    redigerKommentar,
    sletKommentar,
    getProjectByIde,
  } = useStore();
  const [kommentar, setKommentar] = useState("");
  const [redigererIde, setRedigererIde] = useState(false);
  const [redigerTitel, setRedigerTitel] = useState("");
  const [redigerBeskrivelse, setRedigerBeskrivelse] = useState("");
  const [sletModal, setSletModal] = useState(false);
  const [redigererKommentarId, setRedigererKommentarId] = useState<
    string | null
  >(null);
  const [redigerKommentarTekst, setRedigerKommentarTekst] = useState("");
  const [slettet, setSlettet] = useState(false);

  const idea = ideas.find((i) => i.id === params.id);
  // Undgå notFound() i det korte vindue mellem sletIde() og at router.push
  // rent faktisk skifter route — ellers blafrer en 404 op før navigationen.
  if (slettet) return null;
  if (!idea) return notFound();

  const forfatter = getUser(idea.forfatterId);
  const projekt = getProjectByIde(idea.id);
  const afvist = idea.status === "afvist";
  const erForfatter = idea.forfatterId === currentUser.id;
  const maaSlette = erForfatter || kanStyre(rolle);
  const sorteredeKommentarer = [...idea.kommentarer].sort((a, b) => {
    if (!!a.erBegrundelse !== !!b.erBegrundelse) return a.erBegrundelse ? -1 : 1;
    return (
      b.stemmer - a.stemmer || +new Date(b.oprettet) - +new Date(a.oprettet)
    );
  });

  function sendKommentar(e: React.FormEvent) {
    e.preventDefault();
    if (!kommentar.trim()) return;
    tilfoejKommentar(idea!.id, kommentar.trim());
    setKommentar("");
  }

  function startRedigerIde() {
    setRedigerTitel(idea!.titel);
    setRedigerBeskrivelse(idea!.beskrivelse);
    setRedigererIde(true);
  }

  function gemRedigerIde(e: React.FormEvent) {
    e.preventDefault();
    if (!redigerTitel.trim() || !redigerBeskrivelse.trim()) return;
    redigerIde(idea!.id, redigerTitel.trim(), redigerBeskrivelse.trim());
    setRedigererIde(false);
  }

  function bekraeftSletIde() {
    setSlettet(true);
    sletIde(idea!.id);
    router.push("/ideer");
  }

  function startRedigerKommentar(kommentarId: string, tekst: string) {
    setRedigererKommentarId(kommentarId);
    setRedigerKommentarTekst(tekst);
  }

  function gemRedigerKommentar(kommentarId: string) {
    if (!redigerKommentarTekst.trim()) return;
    redigerKommentar(idea!.id, kommentarId, redigerKommentarTekst.trim());
    setRedigererKommentarId(null);
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/ideer"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-700"
      >
        <ArrowLeft size={15} /> Tilbage til idéer
      </Link>

      {projekt && (
        <Link href={`/teams/${projekt.id}`} className="mb-4 block">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition-colors hover:bg-emerald-100/70">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <Rocket size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Denne idé blev til et projekt 🎉
              </p>
              <p className="text-sm text-emerald-700">
                {forfatter?.navn}s idé eksekveres nu som «{projekt.navn}» — følg
                fremdriften her.
              </p>
            </div>
            <ArrowLeft size={16} className="rotate-180 text-emerald-600" />
          </div>
        </Link>
      )}

      {afvist && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <XCircle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-rose-800">
              Denne idé blev afvist
            </p>
            <p className="text-sm text-rose-700">
              Begrundelsen står fremhævet i feedbacken nedenfor. Kommentarer og
              upvotes forbliver synlige.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="relative">
            <CardBody>
              {erForfatter && !redigererIde && (
                <button
                  onClick={startRedigerIde}
                  className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Redigér idé"
                >
                  <Pencil size={15} />
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <KategoriChip kategoriId={idea.kategoriId} />
                <BeslutningsMarkoer ideId={idea.id} />
                <span className="text-xs text-muted">
                  {datoKort(idea.oprettet)}
                </span>
              </div>

              {redigererIde ? (
                <form onSubmit={gemRedigerIde} className="mt-3 space-y-3">
                  <input
                    className={FELT}
                    value={redigerTitel}
                    onChange={(e) => setRedigerTitel(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className={cn(FELT, "min-h-28 resize-y")}
                    value={redigerBeskrivelse}
                    onChange={(e) => setRedigerBeskrivelse(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setRedigererIde(false)}
                    >
                      Annullér
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !redigerTitel.trim() || !redigerBeskrivelse.trim()
                      }
                    >
                      Gem ændringer
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="mt-2 pr-8 text-2xl font-semibold tracking-tight">
                    {idea.titel}
                  </h1>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
                    {idea.beskrivelse}
                  </p>
                </>
              )}

              {!afvist && !redigererIde && (
                <div
                  data-tour="ide-stemmer"
                  className="mt-5 border-t border-slate-100 pt-4"
                >
                  <p className="mb-2 text-sm text-muted">
                    Hvad synes du om idéen?
                  </p>
                  <BeslutningsKnapper ideId={idea.id} layout="stor" />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Kommentarer / feedback */}
          <Card>
            <CardBody>
              <h2 className="mb-4 font-semibold">
                Feedback ({idea.kommentarer.length})
              </h2>

              <form onSubmit={sendKommentar} className="mb-5 flex gap-2">
                <input
                  value={kommentar}
                  onChange={(e) => setKommentar(e.target.value)}
                  placeholder="Giv konstruktiv feedback…"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <Button type="submit" disabled={!kommentar.trim()}>
                  <Send size={15} /> Send
                </Button>
              </form>

              <div className="space-y-4">
                {idea.kommentarer.length === 0 && (
                  <p className="text-sm text-muted">
                    Ingen kommentarer endnu — vær den første til at give feedback.
                  </p>
                )}
                {sorteredeKommentarer.map((k) => {
                  const u = getUser(k.forfatterId);
                  const stemt = harStemtKommentar(idea.id, k.id);
                  const erBegrundelse = k.erBegrundelse;
                  const egenKommentar = k.forfatterId === currentUser.id;
                  const redigererDenne = redigererKommentarId === k.id;
                  return (
                    <div key={k.id} className="flex gap-3">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white",
                          erBegrundelse
                            ? "bg-rose-500"
                            : (u?.avatarFarve ?? "bg-slate-400"),
                        )}
                      >
                        {erBegrundelse ? (
                          <XCircle size={16} />
                        ) : (
                          initialer(u?.navn ?? "?")
                        )}
                      </span>
                      <div
                        className={cn(
                          "relative min-w-0 flex-1 rounded-xl px-3.5 py-2.5",
                          erBegrundelse ? "bg-rose-50" : "bg-slate-50",
                          egenKommentar && !redigererDenne && "pr-16",
                        )}
                      >
                        {egenKommentar && !redigererDenne && (
                          <div className="absolute right-2 top-2 flex gap-1">
                            <button
                              onClick={() => startRedigerKommentar(k.id, k.tekst)}
                              className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                              aria-label="Redigér kommentar"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Slet denne kommentar?")) {
                                  sletKommentar(idea.id, k.id);
                                }
                              }}
                              className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-rose-600"
                              aria-label="Slet kommentar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {erBegrundelse && (
                            <span className="text-sm font-semibold text-rose-700">
                              Begrundelse for afvisning
                            </span>
                          )}
                          <span className="text-sm font-medium">{u?.navn}</span>
                          <span className="text-xs text-muted">
                            {relativDato(k.oprettet)}
                          </span>
                        </div>

                        {redigererDenne ? (
                          <div className="mt-1.5 space-y-2">
                            <textarea
                              className="min-h-16 w-full resize-y rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                              value={redigerKommentarTekst}
                              onChange={(e) =>
                                setRedigerKommentarTekst(e.target.value)
                              }
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRedigererKommentarId(null)}
                              >
                                Annullér
                              </Button>
                              <Button
                                type="button"
                                onClick={() => gemRedigerKommentar(k.id)}
                                disabled={!redigerKommentarTekst.trim()}
                              >
                                Gem
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-sm text-slate-700">{k.tekst}</p>
                        )}
                      </div>
                      {!erBegrundelse && !redigererDenne && (
                        <button
                          onClick={() => stemKommentar(idea.id, k.id)}
                          className={cn(
                            "flex h-fit shrink-0 flex-col items-center rounded-lg border px-2 py-1 transition-colors",
                            stemt
                              ? "border-brand-300 bg-brand-50 text-brand-700"
                              : "border-slate-200 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50",
                          )}
                          aria-label="Upvote kommentar"
                        >
                          <ArrowBigUp
                            size={16}
                            className={stemt ? "fill-brand-500" : ""}
                          />
                          <span className="text-xs font-semibold">{k.stemmer}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">Indsendt af</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-white",
                    forfatter?.avatarFarve ?? "bg-slate-400",
                  )}
                >
                  {initialer(forfatter?.navn ?? "?")}
                </span>
                <div>
                  <p className="font-medium">{forfatter?.navn}</p>
                  <p className="text-xs text-muted">
                    {forfatter?.titel} · {forfatter?.afdeling}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {maaSlette && (
            <Card>
              <CardBody>
                <button
                  onClick={() => setSletModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
                >
                  <Trash2 size={15} /> Slet idé
                </button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal open={sletModal} onClose={() => setSletModal(false)} titel="Slet idé">
        <p className="text-sm text-muted">
          Er du sikker? Slettede idéer forsvinder permanent fra platformen —
          kommentarer og upvotes kan ikke gendannes.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSletModal(false)}>
            Annullér
          </Button>
          <Button variant="danger" onClick={bekraeftSletIde}>
            <Trash2 size={15} /> Slet idé
          </Button>
        </div>
      </Modal>
    </div>
  );
}
