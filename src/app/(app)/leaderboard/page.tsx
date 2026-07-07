"use client";

import * as Icons from "lucide-react";
import { Crown, Flame, Medal, Sparkles } from "lucide-react";
import { Avatar, Card, CardBody, Pill, SectionHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { badges, users } from "@/lib/data/users";
import { niveauAf } from "@/lib/niveau";
import { cn } from "@/lib/utils";

function BadgeIkon({ navn, className }: { navn: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[navn];
  return Cmp ? <Cmp size={16} className={className} /> : <Sparkles size={16} className={className} />;
}

export default function LeaderboardPage() {
  const { currentUser, visErfaring } = useStore();

  /** Aktuel brugers erfaring er levende (session-bonus); andres er den seedede værdi. */
  const erfaringFor = (id: string, seedErfaring: number) =>
    id === currentUser.id ? visErfaring : seedErfaring;

  const rangliste = [...users].sort((a, b) => {
    const ea = erfaringFor(a.id, a.erfaring);
    const eb = erfaringFor(b.id, b.erfaring);
    const na = niveauAf(ea);
    const nb = niveauAf(eb);
    if (nb !== na) return nb - na;
    return eb - ea; // samme niveau: flest erfaringspoint vinder
  });
  const top3 = rangliste.slice(0, 3);
  const resten = rangliste.slice(3);

  const podie = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podieHoejde = ["h-24", "h-32", "h-20"];
  const podiePlads = [2, 1, 3];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        titel="Leaderboard"
        beskrivelse="Innovation er en holdsport. Stig i niveau ved at dele idéer, tage stilling til andres og give feedback."
      />

      {/* Podie */}
      <div data-tour="leaderboard">
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-accent-600 px-6 pt-6">
          <div className="flex items-end justify-center gap-3 sm:gap-6">
            {podie.map((u, i) => {
              const niveau = niveauAf(erfaringFor(u.id, u.erfaring));
              return (
                <div key={u.id} className="flex w-24 flex-col items-center sm:w-28">
                  {podiePlads[i] === 1 && (
                    <Crown className="mb-1 text-amber-300" size={24} />
                  )}
                  <Avatar
                    navn={u.navn}
                    farve={u.avatarFarve}
                    size={podiePlads[i] === 1 ? "xl" : "lg"}
                    niveau={niveau}
                  />
                  <p className="mt-2 text-center text-xs font-medium text-white">
                    {u.navn}
                  </p>
                  <p className="text-xs text-white/80">Niveau {niveau}</p>
                  <div
                    className={cn(
                      "mt-2 w-full rounded-t-xl bg-white/15",
                      podieHoejde[i],
                    )}
                  >
                    <p className="pt-2 text-center text-2xl font-bold text-white/90">
                      {podiePlads[i]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fuld rangliste */}
        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-4 font-semibold">Komplet rangliste</h2>
            <div className="space-y-1">
              {rangliste.map((u, i) => {
                const erMig = u.id === currentUser.id;
                const niveau = niveauAf(erfaringFor(u.id, u.erfaring));
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      erMig ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50",
                    )}
                  >
                    <span className="w-6 text-center text-sm font-semibold text-slate-400">
                      {i < 3 ? (
                        <Medal
                          size={18}
                          className={cn(
                            "mx-auto",
                            i === 0 && "text-amber-400",
                            i === 1 && "text-slate-400",
                            i === 2 && "text-amber-700",
                          )}
                        />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <Avatar navn={u.navn} farve={u.avatarFarve} niveau={niveau} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {u.navn}
                        {erMig && <Pill tone="brand">Dig</Pill>}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {u.titel} · {u.afdeling}
                      </p>
                    </div>
                    <div className="flex -space-x-1">
                      {u.badges.slice(0, 3).map((b) => (
                        <span
                          key={b.id}
                          className="grid h-6 w-6 place-items-center rounded-full bg-amber-50 text-amber-600 ring-2 ring-white"
                          title={b.navn}
                        >
                          <BadgeIkon navn={b.ikon} />
                        </span>
                      ))}
                    </div>
                    <span className="w-20 text-right text-sm font-semibold text-brand-600">
                      Niveau {niveau}
                    </span>
                  </div>
                );
              })}
            </div>
            {resten.length === 0 && null}
          </CardBody>
        </Card>

        {/* Badges + sådan stiger du i niveau */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Flame size={18} className="text-rose-500" /> Mærker at samle
              </h2>
              <div className="space-y-3">
                {Object.values(badges).map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                      <BadgeIkon navn={b.ikon} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{b.navn}</p>
                      <p className="text-xs text-muted">{b.beskrivelse}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold">Sådan stiger du i niveau</h2>
              <ul className="space-y-2 text-sm">
                {[
                  "Indsend en idé",
                  "Upvote eller spring en idé over",
                  "Kommentér på en idé",
                ].map((tekst) => (
                  <li
                    key={tekst}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-slate-600">{tekst}</span>
                    <span className="font-semibold text-brand-600">+1 opgave</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                5 opgaver = 1 niveau. Dine egne idéer tæller ikke med, når du
                stemmer eller kommenterer på dem.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
