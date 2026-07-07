"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lightbulb, PartyPopper } from "lucide-react";
import { Button, Card, CardBody } from "@/components/ui";
import {
  BeslutningsKnapper,
  FremdriftsRing,
  InlineKommentarForm,
  KategoriChip,
} from "@/components/shared";
import { NyIdeModal } from "@/components/NyIdeModal";
import { kanStyre, useStore } from "@/lib/store";
import { erAaben } from "@/lib/data";
import { getUser } from "@/lib/data/users";
import { hilsen } from "@/lib/utils";

export default function DelDinMeningPage() {
  const { currentUser, rolle, ideas, erBesluttet } = useStore();
  const [modal, setModal] = useState(false);
  const router = useRouter();

  // Ledere lander på deres Overblik ved første besøg (men kan frit gå hertil bagefter).
  useEffect(() => {
    if (kanStyre(rolle) && !sessionStorage.getItem("spire.landet")) {
      sessionStorage.setItem("spire.landet", "1");
      router.replace("/overblik");
    }
  }, [rolle, router]);

  // Kø: åbne idéer man endnu ikke har taget stilling til (egne er auto-upvotet og derfor ude).
  const aabne = ideas.filter(erAaben);
  const ko = [...aabne]
    .filter((i) => !erBesluttet(i.id))
    .sort((a, b) => b.stemmer - a.stemmer);

  const total = aabne.length;
  const besluttet = total - ko.length;

  return (
    <div className="animate-fade-in space-y-7">
      {/* Hero — opfordrer til at dele en idé */}
      <div
        data-tour="del-ide"
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-accent-600 px-6 py-7 text-white sm:px-8"
      >
        <p className="text-sm text-white/80">
          {hilsen()}, {currentUser.navn.split(" ")[0]} 👋
        </p>
        <h1 className="mt-1 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Din næste gode idé kan blive virksomhedens næste store gevinst
        </h1>
        <p className="mt-2 max-w-xl text-white/80">
          Del din tanke — den bliver set af hele organisationen, og de bedste
          idéer bliver til virkelighed.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={() => setModal(true)}
            className="bg-white text-brand-700 hover:bg-white/90"
          >
            <Lightbulb size={16} /> Indsend en idé
          </Button>
          <Link href="/ideer">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Se alle idéer <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Beslutnings-kø */}
      <div>
        <div
          data-tour="stemme-ko"
          className="mb-4 flex flex-wrap items-end justify-between gap-2"
        >
          <div>
            <h2 className="text-lg font-semibold">Tag stilling til dine kollegers idéer</h2>
            <p className="text-sm text-muted">
              Upvote dem, du tror på, eller spring over. Hver handling tæller mod dit næste niveau.
            </p>
          </div>
          {ko.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
              <FremdriftsRing
                vaerdi={total > 0 ? (besluttet / total) * 100 : 100}
              />
              <span className="text-sm font-medium leading-tight text-slate-600">
                {besluttet}/{total}
                <br />
                <span className="text-xs font-normal text-muted">gennemgået</span>
              </span>
            </div>
          )}
        </div>

        {ko.length === 0 ? (
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <PartyPopper size={28} />
              </span>
              <div>
                <p className="text-lg font-semibold">
                  Sådan, du har givet din mening til kende på alle idéer.
                </p>
                <p className="mt-1 text-sm text-muted">
                  Kom gerne tilbage, når kollegerne har delt nye idéer — eller
                  bidrag selv med én.
                </p>
              </div>
              <Button onClick={() => setModal(true)}>
                <Lightbulb size={16} /> Indsend en idé
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {ko.map((idea) => {
              const forfatter = getUser(idea.forfatterId);
              return (
                <Card
                  key={idea.id}
                  className="animate-fade-in transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200"
                >
                  <CardBody className="space-y-3">
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
                      <h3 className="font-semibold leading-snug group-hover:text-brand-700">
                        {idea.titel}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {idea.beskrivelse}
                      </p>
                    </Link>
                    <BeslutningsKnapper ideId={idea.id} layout="stor" />
                    <InlineKommentarForm ideaId={idea.id} />
                  </CardBody>
                </Card>
              );
            })}
            <p className="flex items-center justify-center gap-1.5 pt-1 text-sm text-muted">
              <CheckCircle2 size={14} /> {ko.length} idé
              {ko.length === 1 ? "" : "er"} tilbage at tage stilling til
            </p>
          </div>
        )}
      </div>

      <NyIdeModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
