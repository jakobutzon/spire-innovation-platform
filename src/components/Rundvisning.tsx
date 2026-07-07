"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import type { Rolle } from "@/lib/types";

const RUNDVISNING_KEY = "spire.rundvisning";
/** Dispatch `window.dispatchEvent(new Event(RUNDVISNING_EVENT))` for at (gen)starte. */
export const RUNDVISNING_EVENT = "spire:rundvisning";

interface Trin {
  rute: string;
  /** Rollen trinnet kræver — rundvisningen skifter selv. */
  rolle: Rolle;
  /** Matcher et element med data-tour="…" der fremhæves. */
  target: string;
  titel: string;
  tekst: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Guidet rundvisning gennem hele kerneflowet. Starter automatisk første gang
 * man udforsker som gæst, og kan genstartes via RUNDVISNING_EVENT (knappen i
 * sidemenuen). Skifter selv side og demo-rolle undervejs, og fremhæver det
 * relevante element med en blød ring — bevidst uden mørkt bagtæppe.
 */
export function Rundvisning() {
  const router = useRouter();
  const { gaest } = useAuth();
  const { rolle, saetRolle, projects } = useStore();

  const [mounted, setMounted] = useState(false);
  const [aktiv, setAktiv] = useState(false);
  const [trin, setTrin] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const rolleRef = useRef(rolle);
  useEffect(() => {
    rolleRef.current = rolle;
  }, [rolle]);

  useEffect(() => setMounted(true), []);

  const trinListe = useMemo<Trin[]>(() => {
    const foersteProjektId = projects[0]?.id;
    return [
      {
        rute: "/",
        rolle: "medarbejder",
        target: "del-ide",
        titel: "Velkommen til Spire 👋",
        tekst:
          "Det hele starter her: del din idé med hele organisationen via »Indsend en idé«. Dit navn følger idéen hele vejen — fra forslag til færdigt projekt.",
      },
      {
        rute: "/",
        rolle: "medarbejder",
        target: "stemme-ko",
        titel: "Stem på kollegernes idéer",
        tekst:
          "Upvote de idéer du tror på, eller spring over — og giv feedback direkte i kommentarfeltet under hver idé. Alt er offentligt, så de bedste idéer stiger til tops.",
      },
      {
        rute: "/",
        rolle: "medarbejder",
        target: "niveau",
        titel: "Optjen niveauer",
        tekst:
          "Hver handling tæller: del en idé, stem, eller kommentér. 5 opgaver = 1 niveau, og dit niveau vises som badge på din avatar — synligt for alle.",
      },
      {
        rute: "/ideer",
        rolle: "medarbejder",
        target: "kategori-filtre",
        titel: "Alle idéer ét sted",
        tekst:
          "Under Idéer kan du filtrere på kategori og følge diskussionerne. Afviste idéer forsvinder ikke — de ligger nederst med lederens begrundelse.",
      },
      {
        rute: "/overblik",
        rolle: "leder",
        target: "beslutning",
        titel: "Lederens beslutning",
        tekst:
          "Vi har skiftet dig til leder-rollen. På Overblik ser lederen alle åbne idéer sorteret efter opbakning — og beslutter: »Send til projekt« eller »Afvis« med en begrundelse.",
      },
      {
        rute: "/teams",
        rolle: "leder",
        target: "board",
        titel: "Fra idé til eksekvering",
        tekst:
          "Godkendte idéer bliver projekter på boardet. Flyt dem gennem stadierne — det sidste trin er mål-linjen, hvor projektet markeres succesfuldt eller ej.",
      },
      {
        rute: foersteProjektId ? `/teams/${foersteProjektId}` : "/teams",
        rolle: "leder",
        target: "eksekvering",
        titel: "Eksekvér i projektet",
        tekst:
          "Inde i projektet arbejder teamet med en to-do-liste og en kommentartråd — og idémageren står som lead med fuld credit for idéen.",
      },
      {
        rute: "/leaderboard",
        rolle: "leder",
        target: "leaderboard",
        titel: "Innovation som holdsport",
        tekst:
          "Leaderboardet rangerer alle efter niveau, og der er mærker at samle undervejs. Synligheden gør det motiverende at bidrage.",
      },
      {
        rute: "/",
        rolle: "medarbejder",
        target: "rolleskift",
        titel: "Du er klar! 🎉",
        tekst:
          "Vi har sat dig tilbage som medarbejder. Du kan når som helst skifte demo-rolle heroppe og se platformen fra leder-perspektivet. God fornøjelse!",
      },
    ];
  }, [projects]);

  const start = useCallback(() => {
    // Slå leder-landing-redirect fra, så rundvisningen selv styrer navigationen.
    try {
      sessionStorage.setItem("spire.landet", "1");
    } catch {
      // ignorér
    }
    setTrin(0);
    setAktiv(true);
  }, []);

  const slut = useCallback(() => {
    try {
      localStorage.setItem(RUNDVISNING_KEY, "faerdig");
    } catch {
      // ignorér
    }
    setAktiv(false);
    setRect(null);
    if (rolleRef.current !== "medarbejder") saetRolle("medarbejder");
  }, [saetRolle]);

  // Auto-start for gæster, der ikke har set rundvisningen endnu.
  useEffect(() => {
    if (!gaest || aktiv) return;
    try {
      if (localStorage.getItem(RUNDVISNING_KEY) === "faerdig") return;
    } catch {
      return;
    }
    start();
  }, [gaest, aktiv, start]);

  // Manuel (gen)start via event — bruges af "Se rundvisningen"-knappen.
  useEffect(() => {
    const handler = () => start();
    window.addEventListener(RUNDVISNING_EVENT, handler);
    return () => window.removeEventListener(RUNDVISNING_EVENT, handler);
  }, [start]);

  // Pr. trin: skift rolle/side, find target-elementet og følg dets position.
  useEffect(() => {
    if (!aktiv) return;
    const s = trinListe[trin];
    if (!s) return;

    if (rolleRef.current !== s.rolle) saetRolle(s.rolle);
    router.push(s.rute);
    setRect(null);

    let element: HTMLElement | null = null;
    const opdater = () => {
      if (!element || !element.isConnected) return;
      const r = element.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const startTid = Date.now();
    const poll = setInterval(() => {
      element = document.querySelector<HTMLElement>(
        `[data-tour="${s.target}"]`,
      );
      if (element) {
        clearInterval(poll);
        element.scrollIntoView({ block: "center", behavior: "smooth" });
        opdater();
      } else if (Date.now() - startTid > 3500) {
        clearInterval(poll); // target findes ikke (fx skjult på mobil) — vis kun kortet
      }
    }, 120);

    // Følg med under smooth-scroll, resize og layout-skift.
    const tracker = setInterval(opdater, 250);
    window.addEventListener("scroll", opdater, true);
    window.addEventListener("resize", opdater);
    return () => {
      clearInterval(poll);
      clearInterval(tracker);
      window.removeEventListener("scroll", opdater, true);
      window.removeEventListener("resize", opdater);
    };
  }, [aktiv, trin, trinListe, router, saetRolle]);

  if (!mounted || !aktiv) return null;
  const s = trinListe[trin];
  const sidste = trin === trinListe.length - 1;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Blød fremhævnings-ring om det aktuelle element */}
      {rect && (
        <div
          className="absolute rounded-2xl ring-4 ring-brand-500/60 shadow-[0_0_0_8px_rgba(99,102,241,0.12)] transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Trin-kort */}
      <div
        key={trin}
        className="pointer-events-auto fixed bottom-5 left-4 right-4 animate-fade-in rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:left-auto sm:right-6 sm:w-96"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Rundvisning · Trin {trin + 1} af {trinListe.length}
          </span>
          <button
            onClick={slut}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Luk rundvisning"
          >
            <X size={15} />
          </button>
        </div>

        <h3 className="font-semibold">{s.titel}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.tekst}</p>

        {/* Fremdriftsprikker */}
        <div className="mt-3 flex gap-1.5">
          {trinListe.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === trin ? "w-5 bg-brand-500" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={slut}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Spring over
          </button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setTrin((t) => Math.max(0, t - 1))}
              disabled={trin === 0}
            >
              <ArrowLeft size={14} /> Forrige
            </Button>
            {sidste ? (
              <Button onClick={slut}>
                <Check size={14} /> Afslut
              </Button>
            ) : (
              <Button onClick={() => setTrin((t) => t + 1)}>
                Næste <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
