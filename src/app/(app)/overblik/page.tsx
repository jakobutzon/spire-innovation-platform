"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowBigUp,
  Check,
  Inbox,
  Lightbulb,
  Lock,
  Rocket,
  Users as UsersIcon,
  X,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  EmptyState,
  SectionHeader,
} from "@/components/ui";
import { AfvisIdeModal, KategoriChip, TopKommentar } from "@/components/shared";
import { kanStyre, useStore } from "@/lib/store";
import { getUser, users } from "@/lib/data/users";
import { erAaben } from "@/lib/data";
import { niveauAf } from "@/lib/niveau";

export default function OverblikPage() {
  const { rolle, ideas, sendTilProjekt, currentUser, visErfaring } =
    useStore();
  const [afvisMaal, setAfvisMaal] = useState<{
    id: string;
    titel: string;
  } | null>(null);

  /** Aktuel brugers erfaring er levende (session-bonus); andres er den seedede værdi. */
  const erfaringFor = (id: string, seedErfaring: number) =>
    id === currentUser.id ? visErfaring : seedErfaring;

  if (!kanStyre(rolle)) {
    return (
      <div className="animate-fade-in">
        <SectionHeader titel="Overblik" />
        <EmptyState
          icon={<Lock size={40} />}
          titel="Overblik er for ledere"
          tekst="Her træffer ledere de afgørende beslutninger på kollegernes idéer. Skift til rollen Leder i toppen — eller gå til Del din mening og bidrag med en idé."
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

  // Åbne idéer (ikke sendt til projekt eller afvist) — sorteret på mest populære.
  const tilBeslutning = ideas
    .filter(erAaben)
    .sort((a, b) => b.stemmer - a.stemmer);

  return (
    <div className="animate-fade-in space-y-8">
      <SectionHeader
        titel="Overblik"
        beskrivelse="Din vigtigste rolle: tag den afgørende beslutning på kollegernes idéer. Send de bedste videre til et projekt, eller afvis dem — så holder du idéstrømmen skarp."
      />

      {/* Idéer til beslutning */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm">
              <Inbox size={17} />
            </span>
            <h2 className="text-lg font-semibold">Idéer til beslutning</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
            {tilBeslutning.length} åbne · sorteret efter flest upvotes
          </span>
        </div>

        {tilBeslutning.length === 0 ? (
          <EmptyState
            icon={<Check size={40} />}
            titel="Alle idéer er behandlet"
            tekst="Der er ingen åbne idéer lige nu. Nye idéer fra kollegerne dukker op her, så snart de deles."
          />
        ) : (
          <div className="space-y-4">
            {tilBeslutning.map((idea) => {
              const forfatter = getUser(idea.forfatterId);
              return (
                <Card
                  key={idea.id}
                  className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200"
                >
                  <CardBody className="flex gap-4">
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-slate-200 px-2 py-1.5 text-slate-500">
                      <ArrowBigUp size={18} />
                      <span className="text-sm font-semibold">{idea.stemmer}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <KategoriChip kategoriId={idea.kategoriId} />
                        <span className="text-xs text-muted">
                          af{" "}
                          <span className="font-medium text-slate-600">
                            {forfatter?.navn}
                          </span>
                        </span>
                      </div>
                      <Link href={`/ideer/${idea.id}`} className="group block">
                        <h3 className="mt-1.5 font-semibold leading-snug group-hover:text-brand-700">
                          {idea.titel}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {idea.beskrivelse}
                        </p>
                      </Link>

                      <TopKommentar kommentarer={idea.kommentarer} />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => sendTilProjekt(idea.id)}>
                          <Rocket size={15} /> Send til projekt
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setAfvisMaal({ id: idea.id, titel: idea.titel })
                          }
                        >
                          <X size={15} /> Afvis
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Medarbejdere */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
              <UsersIcon size={17} />
            </span>
            <h2 className="text-lg font-semibold">Medarbejdere</h2>
          </div>
          <span className="text-sm text-muted">{users.length} profiler</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...users]
            .sort(
              (a, b) =>
                erfaringFor(b.id, b.erfaring) - erfaringFor(a.id, a.erfaring),
            )
            .map((u) => {
              const antalIdeer = ideas.filter(
                (i) => i.forfatterId === u.id,
              ).length;
              const niveau = niveauAf(erfaringFor(u.id, u.erfaring));
              return (
                <Card
                  key={u.id}
                  className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200"
                >
                  <CardBody className="flex items-center gap-3">
                    <Avatar
                      navn={u.navn}
                      farve={u.avatarFarve}
                      size="lg"
                      niveau={niveau}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{u.navn}</p>
                      <p className="truncate text-xs text-muted">
                        {u.titel} · {u.afdeling}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-600">
                        Niveau {niveau}
                      </p>
                      <p className="text-[11px] text-muted">
                        {antalIdeer} idé{antalIdeer === 1 ? "" : "er"}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </div>
      </div>

      <AfvisIdeModal idea={afvisMaal} onClose={() => setAfvisMaal(null)} />
    </div>
  );
}
