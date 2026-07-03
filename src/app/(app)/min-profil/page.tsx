"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import {
  Award,
  Camera,
  FolderKanban,
  KeyRound,
  Lightbulb,
  Loader2,
  LogOut,
  Pencil,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  EmptyState,
  Pill,
  ProgressBar,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import {
  KategoriChip,
  ProjektStatusPill,
  UdfaldBadge,
} from "@/components/shared";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";
import { OPGAVER_PR_NIVEAU } from "@/lib/niveau";
import { cn } from "@/lib/utils";

/** Farvepalette til avatar (uden rød/grøn-konflikt med udfald). */
const AVATAR_FARVER = [
  "bg-brand-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-pink-500",
  "bg-slate-500",
];

function BadgeIkon({ navn }: { navn: string }) {
  const Cmp = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ size?: number; className?: string }>
    >
  )[navn];
  return Cmp ? <Cmp size={16} /> : <Sparkles size={16} />;
}

export default function MinProfilPage() {
  const {
    currentUser,
    niveau,
    niveauFremgang,
    ideas,
    projects,
    opdaterProfil,
  } = useStore();

  const [redigerer, setRedigerer] = useState(false);

  const mineIdeer = ideas.filter((i) => i.forfatterId === currentUser.id);
  const mineProjekter = projects.filter(
    (p) =>
      p.leadId === currentUser.id || p.medlemIds.includes(currentUser.id),
  );
  const procent = (niveauFremgang / OPGAVER_PR_NIVEAU) * 100;

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        titel="Min profil"
        beskrivelse="Din identitet på platformen, dine idéer og projekter, og din progression."
      />

      {/* Profil-header */}
      <Card>
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar
            navn={currentUser.navn}
            farve={currentUser.avatarFarve}
            billedeUrl={currentUser.avatarUrl}
            size="xl"
            niveau={niveau}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {currentUser.navn}
              </h2>
              <Pill tone="brand">Niveau {niveau}</Pill>
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {currentUser.titel} · {currentUser.afdeling}
            </p>
            <div className="mt-3 max-w-sm">
              <div className="mb-1 flex items-center justify-between text-xs text-muted">
                <span>Fremgang mod niveau {niveau + 1}</span>
                <span className="font-medium text-slate-600">
                  {niveauFremgang}/{OPGAVER_PR_NIVEAU}
                </span>
              </div>
              <ProgressBar value={procent} />
            </div>
          </div>
          <Button variant="secondary" onClick={() => setRedigerer(true)}>
            <Pencil size={15} /> Rediger profil
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Venstre: idéer + projekter */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody>
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm">
                  <Lightbulb size={16} />
                </span>
                <h3 className="font-semibold">
                  Mine idéer{" "}
                  <span className="text-sm font-normal text-muted">
                    ({mineIdeer.length})
                  </span>
                </h3>
              </div>
              {mineIdeer.length === 0 ? (
                <EmptyState
                  icon={<Lightbulb size={32} />}
                  titel="Ingen idéer endnu"
                  tekst="Del din første idé fra 'Del din mening' eller 'Idéer'."
                />
              ) : (
                <div className="space-y-2">
                  {mineIdeer.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`/ideer/${idea.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {idea.titel}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <KategoriChip kategoriId={idea.kategoriId} />
                          {idea.status === "afvist" ? (
                            <Pill tone="rose">Afvist</Pill>
                          ) : idea.status === "i-projekt" ? (
                            <Pill tone="violet">I projekt</Pill>
                          ) : (
                            <Pill tone="green">Åben</Pill>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted">
                        {idea.stemmer} upvotes
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
                  <FolderKanban size={16} />
                </span>
                <h3 className="font-semibold">
                  Mine projekter{" "}
                  <span className="text-sm font-normal text-muted">
                    ({mineProjekter.length})
                  </span>
                </h3>
              </div>
              {mineProjekter.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban size={32} />}
                  titel="Ingen projekter endnu"
                  tekst="Når en af dine idéer sendes videre, dukker projektet op her."
                />
              ) : (
                <div className="space-y-2">
                  {mineProjekter.map((p) => (
                    <Link
                      key={p.id}
                      href={`/teams/${p.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.navn}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <ProjektStatusPill status={p.status} />
                          {p.udfald && <UdfaldBadge udfald={p.udfald} />}
                          {p.leadId === currentUser.id && (
                            <Pill tone="amber">Lead</Pill>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Højre: nøgletal + mærker */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatTile
              label="Idéer"
              value={mineIdeer.length}
              icon={<Lightbulb size={18} />}
              tone="brand"
            />
            <StatTile
              label="Projekter"
              value={mineProjekter.length}
              icon={<FolderKanban size={18} />}
              tone="violet"
            />
            <StatTile
              label="Niveau"
              value={niveau}
              icon={<TrendingUp size={18} />}
              tone="green"
            />
            <StatTile
              label="Mærker"
              value={currentUser.badges.length}
              icon={<Award size={18} />}
              tone="amber"
            />
          </div>

          <Card>
            <CardBody>
              <h3 className="mb-3 font-semibold">Mine mærker</h3>
              {currentUser.badges.length === 0 ? (
                <p className="text-sm text-muted">
                  Du har ingen mærker endnu — vær aktiv for at optjene dem.
                </p>
              ) : (
                <div className="space-y-3">
                  {currentUser.badges.map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                        <BadgeIkon navn={b.ikon} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{b.navn}</p>
                        <p className="text-xs text-muted">{b.beskrivelse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <KontoKort />
        </div>
      </div>

      {redigerer && (
        <RedigerProfilModal
          onClose={() => setRedigerer(false)}
          currentUser={currentUser}
          opdaterProfil={opdaterProfil}
        />
      )}
    </div>
  );
}

function RedigerProfilModal({
  onClose,
  currentUser,
  opdaterProfil,
}: {
  onClose: () => void;
  currentUser: ReturnType<typeof useStore>["currentUser"];
  opdaterProfil: ReturnType<typeof useStore>["opdaterProfil"];
}) {
  const { bruger } = useAuth();
  const [navn, setNavn] = useState(currentUser.navn);
  const [titel, setTitel] = useState(currentUser.titel);
  const [afdeling, setAfdeling] = useState(currentUser.afdeling);
  const [farve, setFarve] = useState(currentUser.avatarFarve);
  const [billede, setBillede] = useState<string | undefined>(
    currentUser.avatarUrl,
  );
  const [uploader, setUploader] = useState(false);
  const [fejl, setFejl] = useState("");
  const filInput = useRef<HTMLInputElement>(null);

  async function vaelgBillede(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    if (!fil.type.startsWith("image/")) {
      setFejl("Vælg venligst en billedfil.");
      return;
    }
    if (fil.size > 1.5 * 1024 * 1024) {
      setFejl("Billedet må højst fylde 1,5 MB.");
      return;
    }
    setFejl("");

    // Logget ind → upload til Supabase Storage (ægte, deles på tværs af enheder).
    const supabase = getSupabase();
    if (bruger && supabase) {
      setUploader(true);
      const ext = fil.name.split(".").pop() || "png";
      const sti = `${bruger.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("spire-avatars")
        .upload(sti, fil, { upsert: true, contentType: fil.type });
      if (error) {
        setFejl("Upload fejlede: " + error.message);
        setUploader(false);
        return;
      }
      const { data } = supabase.storage.from("spire-avatars").getPublicUrl(sti);
      setBillede(data.publicUrl);
      setUploader(false);
      return;
    }

    // Gæst/ingen backend → gem lokalt som data-URL.
    const reader = new FileReader();
    reader.onload = () => setBillede(reader.result as string);
    reader.readAsDataURL(fil);
  }

  function gem(e: React.FormEvent) {
    e.preventDefault();
    if (!navn.trim() || !titel.trim() || !afdeling.trim()) return;
    opdaterProfil({
      navn: navn.trim(),
      titel: titel.trim(),
      afdeling: afdeling.trim(),
      avatarFarve: farve,
      avatarUrl: billede,
    });
    // Logget ind → spejl profilen til Supabase (best-effort, blokerer ikke UI).
    const supabase = getSupabase();
    if (bruger && supabase) {
      supabase
        .from("spire_profiles")
        .upsert({
          id: bruger.id,
          visningsnavn: navn.trim(),
          titel: titel.trim(),
          afdeling: afdeling.trim(),
          avatar_farve: farve,
          avatar_url: billede ?? null,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn("Kunne ikke gemme profil i Supabase:", error.message);
        });
    }
    onClose();
  }

  const felt =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <Modal open onClose={onClose} titel="Rediger profil">
      <form onSubmit={gem} className="space-y-4">
        {/* Avatar-preview + billedvalg */}
        <div className="flex items-center gap-4">
          <Avatar navn={navn || "?"} farve={farve} billedeUrl={billede} size="xl" />
          <div className="flex flex-col gap-2">
            <input
              ref={filInput}
              type="file"
              accept="image/*"
              onChange={vaelgBillede}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => filInput.current?.click()}
              disabled={uploader}
            >
              {uploader ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Camera size={15} />
              )}
              {uploader ? "Uploader…" : "Skift billede"}
            </Button>
            {billede && (
              <button
                type="button"
                onClick={() => setBillede(undefined)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 size={13} /> Fjern billede
              </button>
            )}
          </div>
        </div>

        {/* Avatar-farve (bruges når intet billede) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Avatar-farve{" "}
            <span className="font-normal text-muted">(uden billede)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_FARVER.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFarve(f)}
                className={cn(
                  "h-8 w-8 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110",
                  f,
                  farve === f ? "ring-slate-700" : "ring-transparent",
                )}
                aria-label={`Vælg farve ${f}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Navn</label>
          <input
            className={felt}
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Titel</label>
            <input
              className={felt}
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Afdeling</label>
            <input
              className={felt}
              value={afdeling}
              onChange={(e) => setAfdeling(e.target.value)}
            />
          </div>
        </div>

        {fejl && <p className="text-sm text-rose-600">{fejl}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annullér
          </Button>
          <Button
            type="submit"
            disabled={
              uploader || !navn.trim() || !titel.trim() || !afdeling.trim()
            }
          >
            Gem ændringer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Konto-kort: rigtig Supabase-konto (email, skift kode, log ud) eller gæste-info. */
function KontoKort() {
  const { bruger, gaest, harKonfig, signOut, skiftAdgangskode } = useAuth();
  const router = useRouter();
  const [nyKode, setNyKode] = useState("");
  const [travl, setTravl] = useState(false);
  const [besked, setBesked] = useState("");
  const [fejl, setFejl] = useState("");

  async function logUd() {
    await signOut();
    router.replace("/login");
  }

  async function skift(e: React.FormEvent) {
    e.preventDefault();
    setBesked("");
    setFejl("");
    if (nyKode.length < 6) {
      setFejl("Adgangskoden skal være mindst 6 tegn.");
      return;
    }
    setTravl(true);
    const { fejl } = await skiftAdgangskode(nyKode);
    setTravl(false);
    if (fejl) setFejl(fejl);
    else {
      setBesked("Adgangskoden er opdateret.");
      setNyKode("");
    }
  }

  const felt =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  // Gæst → invitér til at oprette en rigtig konto.
  if (!bruger) {
    return (
      <Card>
        <CardBody>
          <h3 className="mb-1 font-semibold">Konto</h3>
          {gaest ? (
            <>
              <p className="text-sm text-muted">
                Du udforsker som <span className="font-medium">gæst</span>. Opret
                en konto for at få din egen login og gemme din profil på tværs af
                enheder.
              </p>
              <Button className="mt-3 w-full" onClick={logUd}>
                <UserPlus size={15} /> Log ind eller opret konto
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted">
              {harKonfig
                ? "Ingen konto fundet."
                : "Login er ikke konfigureret i dette miljø."}
            </p>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h3 className="mb-3 font-semibold">Konto</h3>
        <p className="text-xs text-muted">Logget ind som</p>
        <p className="mb-4 truncate text-sm font-medium">{bruger.email}</p>

        <form onSubmit={skift} className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium">
            <KeyRound size={14} /> Skift adgangskode
          </label>
          <input
            type="password"
            className={felt}
            value={nyKode}
            onChange={(e) => setNyKode(e.target.value)}
            placeholder="Ny adgangskode (min. 6 tegn)"
            autoComplete="new-password"
          />
          {fejl && <p className="text-sm text-rose-600">{fejl}</p>}
          {besked && <p className="text-sm text-emerald-600">{besked}</p>}
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={travl || nyKode.length < 6}
          >
            {travl ? <Loader2 size={15} className="animate-spin" /> : null}
            Opdatér adgangskode
          </Button>
        </form>

        <button
          onClick={logUd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <LogOut size={15} /> Log ud
        </button>
      </CardBody>
    </Card>
  );
}
