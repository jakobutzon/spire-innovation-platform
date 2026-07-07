"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Check, MousePointerClick, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/AuthProvider";
import type { Idea, Project, Rolle, User } from "@/lib/types";

const RUNDVISNING_KEY = "spire.rundvisning";
/** Dispatch `window.dispatchEvent(new Event(RUNDVISNING_EVENT))` for at (gen)starte. */
export const RUNDVISNING_EVENT = "spire:rundvisning";

/** Øjebliksbillede af app-tilstanden — bruges til at opdage, at brugeren har udført handlingen. */
interface Snapshot {
  antalIdeer: number;
  antalAfviste: number;
  antalBesluttedeAndres: number;
  antalMineKommentarer: number;
  antalProjekter: number;
  projektStatus?: string;
  antalOpgaver: number;
  antalProjektKommentarer: number;
}

interface Udfyldning {
  selector: string;
  value: string;
}

interface Trin {
  /** Skift demo-rolle når trinnet starter. */
  rolle?: Rolle;
  /** Navigér automatisk når trinnet starter (bruges kun ved fase-skift). */
  rute?: () => string;
  /** Elementet der fremhæves med spotlight. */
  find: () => HTMLElement | null;
  titel: string;
  tekst: string;
  /** Felter der udfyldes med eksempeltekst, så brugeren kun skal klikke. */
  udfyld?: Udfyldning[];
  /** Handlingen er udført → gå automatisk videre. */
  naarKlar?: (nu: Snapshot, foer: Snapshot, pathname: string) => boolean;
  /** Kør når trinnet fuldføres (fx husk id på den nye idé/projekt). */
  vedFuldfoert?: () => void;
  /** Rent forklaringstrin — vis en knap i stedet for at vente på en handling. */
  manuel?: boolean;
  knap?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const dataTour = (navn: string) => () =>
  document.querySelector<HTMLElement>(`[data-tour="${navn}"]`);

const findKnap = (tekst: string) => () =>
  ([...document.querySelectorAll<HTMLElement>("button")].find((b) =>
    b.textContent?.trim().includes(tekst),
  ) ?? null);

/** Udfyld et React-kontrolleret input/textarea programmatisk. */
function udfyldFelt(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (!setter) return;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Hands-on onboarding for gæste-/demo-brugere: mørkt bagtæppe med et
 * "spotlight-hul" over det element, brugeren skal bruge — og fremdrift sker
 * ved at brugeren faktisk UDFØRER handlingerne (indsend idé, stem, kommentér,
 * afvis/send til projekt som leder, eksekvér projektet). Eksempeltekster
 * udfyldes automatisk, så man kun skal klikke.
 */
export function Rundvisning() {
  const router = useRouter();
  const pathname = usePathname();
  const { gaest } = useAuth();
  const store = useStore();
  const { rolle, saetRolle } = store;

  const [mounted, setMounted] = useState(false);
  const [aktiv, setAktiv] = useState(false);
  const [trin, setTrin] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Levende referencer, så trin-definitioner og intervaller altid ser nyeste tilstand.
  const ideasRef = useRef<Idea[]>(store.ideas);
  const projectsRef = useRef<Project[]>(store.projects);
  const brugerRef = useRef<User>(store.currentUser);
  const rolleRef = useRef(rolle);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    ideasRef.current = store.ideas;
    projectsRef.current = store.projects;
    brugerRef.current = store.currentUser;
    rolleRef.current = rolle;
    pathnameRef.current = pathname;
  });

  const nyIdeIdRef = useRef<string | null>(null);
  const nyProjektIdRef = useRef<string | null>(null);
  /** Status det nye projekt blev født med — trin 17 er klaret, når den er ændret. */
  const projektStartStatusRef = useRef<string | null>(null);
  /** Tal ved tour-START — gør fuldførelses-tjek robuste, selv hvis brugeren er hurtigere end trin-skiftet. */
  const startFoerRef = useRef({ antalIdeer: 0, antalAfviste: 0, antalProjekter: 0 });

  useEffect(() => setMounted(true), []);

  const lavSnapshot = useCallback((): Snapshot => {
    const uid = brugerRef.current.id;
    const ideas = ideasRef.current;
    const projekt = projectsRef.current.find(
      (p) => p.id === nyProjektIdRef.current,
    );
    return {
      antalIdeer: ideas.length,
      antalAfviste: ideas.filter((i) => i.status === "afvist").length,
      antalBesluttedeAndres: ideas.filter(
        (i) =>
          i.forfatterId !== uid &&
          (i.stemtAf.includes(uid) || i.sprungetOver.includes(uid)),
      ).length,
      antalMineKommentarer: ideas.reduce(
        (sum, i) =>
          sum + i.kommentarer.filter((k) => k.forfatterId === uid).length,
        0,
      ),
      antalProjekter: projectsRef.current.length,
      projektStatus: projekt?.status,
      antalOpgaver: projekt?.opgaver.length ?? 0,
      antalProjektKommentarer: projekt?.kommentarer.length ?? 0,
    };
  }, []);

  // Trin-definitionerne læser kun refs, så listen kan ligge i en stabil ref.
  const trinListe = useRef<Trin[]>([
    // ---------- FASE 1: Din første idé ----------
    {
      rolle: "medarbejder",
      rute: () => "/",
      find: () =>
        document.querySelector<HTMLElement>('[data-tour="del-ide"] button'),
      titel: "Velkommen til Spire 👋",
      tekst:
        "Det hele starter med en idé. Prøv selv: klik på »Indsend en idé«.",
      naarKlar: () =>
        !!document.querySelector(
          'input[placeholder="Giv din idé en fængende titel"]',
        ),
    },
    {
      find: () => document.querySelector<HTMLElement>(".max-w-lg"),
      titel: "Din første idé",
      tekst:
        "Vi har udfyldt et eksempel for dig — du skal bare trykke »Indsend idé«.",
      udfyld: [
        {
          selector: 'input[placeholder="Giv din idé en fængende titel"]',
          value: "Månedlig demo-dag på tværs af teams",
        },
        {
          selector:
            'textarea[placeholder="Hvilket problem løser idéen, og hvad er gevinsten?"]',
          value:
            "Én fredag om måneden viser hvert team, hvad de arbejder på. Det skaber videndeling, sparring på tværs og nye idéer — helt uden slides.",
        },
      ],
      naarKlar: (nu) => nu.antalIdeer > startFoerRef.current.antalIdeer,
      vedFuldfoert: () => {
        nyIdeIdRef.current = ideasRef.current[0]?.id ?? null;
      },
    },
    {
      find: () => document.querySelector<HTMLElement>('aside nav a[href="/ideer"]'),
      titel: "Din idé er live! 🎉",
      tekst:
        "Alle i organisationen kan nu se den. Klik på »Idéer« i sidemenuen for at finde den.",
      naarKlar: (_nu, _foer, sti) => sti === "/ideer",
    },
    {
      find: () =>
        nyIdeIdRef.current
          ? document.querySelector<HTMLElement>(
              `a[href="/ideer/${nyIdeIdRef.current}"]`,
            )
          : null,
      titel: "Find din idé",
      tekst:
        "Der er den — øverst i listen. Klik på titlen for at åbne den.",
      naarKlar: (_nu, _foer, sti) => sti === `/ideer/${nyIdeIdRef.current}`,
    },
    {
      find: dataTour("ide-stemmer"),
      titel: "Upvotes og feedback",
      tekst:
        "Her tager kollegerne stilling: upvote idéer de tror på, eller spring over — og giv feedback i kommentarfeltet nedenfor. Din egen idé har automatisk din stemme.",
      manuel: true,
    },

    // ---------- FASE 2: Stem og kommentér ----------
    {
      find: () => document.querySelector<HTMLElement>('aside nav a[href="/ideer"]'),
      titel: "Nu er det din tur",
      tekst: "Gå tilbage til »Idéer« i sidemenuen.",
      naarKlar: (_nu, _foer, sti) => sti === "/ideer",
    },
    {
      find: dataTour("ide-liste"),
      titel: "Tag stilling",
      tekst:
        "Upvote eller spring en af dine kollegers idéer over (pilen til venstre på kortet). Hver handling tæller +1 mod dit næste niveau — se baren ved dit navn øverst.",
      naarKlar: (nu, foer) =>
        nu.antalBesluttedeAndres > foer.antalBesluttedeAndres,
    },
    {
      find: dataTour("ide-liste"),
      titel: "Giv feedback",
      tekst:
        "Kommentér direkte fra listen — vi har skrevet et forslag i det øverste felt. Tryk »Send«. Også det giver +1 mod næste niveau.",
      udfyld: [
        {
          selector: 'input[placeholder="Giv konstruktiv feedback…"]',
          value: "Spændende idé — den vil jeg gerne være med til at teste!",
        },
      ],
      naarKlar: (nu, foer) =>
        nu.antalMineKommentarer > foer.antalMineKommentarer,
    },
    {
      find: () => document.querySelector<HTMLElement>('aside nav a[href="/"]'),
      titel: "Dit personlige overblik",
      tekst: "Klik på »Del din mening« i sidemenuen.",
      naarKlar: (_nu, _foer, sti) => sti === "/",
    },
    {
      find: dataTour("stemme-ko"),
      titel: "Aldrig i tvivl om hvad du mangler",
      tekst:
        "Denne kø viser kun de idéer, du endnu IKKE har taget stilling til — så du altid nemt kan se, hvad du mangler. Tomt = du er ajour.",
      manuel: true,
    },

    // ---------- FASE 3: Lederens perspektiv ----------
    {
      rolle: "leder",
      rute: () => "/overblik",
      find: dataTour("beslutning"),
      titel: "Lederens perspektiv 👑",
      tekst:
        "Dette er, hvad ledere og administratorer ser: alle åbne idéer sorteret efter opbakning. Herfra træffes den afgørende beslutning — send videre eller afvis. Vi har skiftet dig til leder-rollen.",
      manuel: true,
      knap: "Prøv det",
    },
    {
      find: findKnap("Afvis"),
      titel: "Afvis en idé",
      tekst:
        "Prøv først at afvise en idé — klik »Afvis« på et af kortene.",
      naarKlar: () =>
        !!document.querySelector(
          'textarea[placeholder="Forklar kort hvorfor idéen afvises…"]',
        ),
    },
    {
      find: () => document.querySelector<HTMLElement>(".max-w-lg"),
      titel: "Altid med en begrundelse",
      tekst:
        "En afvisning kræver en begrundelse — den vises på idéen, så medarbejderen aldrig efterlades i tvivl. Vi har skrevet én for dig: tryk »Afvis idé«.",
      udfyld: [
        {
          selector: 'textarea[placeholder="Forklar kort hvorfor idéen afvises…"]',
          value:
            "God tanke, men den overlapper med et igangværende initiativ. Vi tager den op igen næste kvartal.",
        },
      ],
      naarKlar: (nu) => nu.antalAfviste > startFoerRef.current.antalAfviste,
    },
    {
      find: findKnap("Send til projekt"),
      titel: "Send en idé videre 🚀",
      tekst:
        "Send nu en anden idé videre til eksekvering — klik »Send til projekt«. Idémageren følger automatisk med som projekt-lead.",
      naarKlar: (nu) => nu.antalProjekter > startFoerRef.current.antalProjekter,
      vedFuldfoert: () => {
        nyProjektIdRef.current = projectsRef.current[0]?.id ?? null;
        projektStartStatusRef.current = projectsRef.current[0]?.status ?? null;
      },
    },

    // ---------- FASE 4: Eksekvér projektet ----------
    {
      rute: () =>
        nyProjektIdRef.current ? `/teams/${nyProjektIdRef.current}` : "/teams",
      find: () =>
        (document
          .querySelector<HTMLElement>('input[placeholder="Tilføj en opgave…"]')
          ?.closest(".rounded-2xl") as HTMLElement | null) ?? null,
      titel: "Her er dit nye projekt",
      tekst:
        "Idéen er nu et projekt med sin egen side. Start eksekveringen: tilføj den første opgave — vi har skrevet den for dig, tryk »Tilføj«.",
      udfyld: [
        {
          selector: 'input[placeholder="Tilføj en opgave…"]',
          value: "Afklar mål og succeskriterier med teamet",
        },
      ],
      // Det nye projekt fødes uden opgaver, så tjekket kan være absolut.
      naarKlar: (nu) => nu.antalOpgaver > 0,
    },
    {
      find: () =>
        (document
          .querySelector<HTMLElement>('input[placeholder="Skriv en kommentar…"]')
          ?.closest(".rounded-2xl") as HTMLElement | null) ?? null,
      titel: "Koordinér i kommentartråden",
      tekst:
        "Teamet koordinerer direkte på projektet. Send din første kommentar — tryk »Send«.",
      udfyld: [
        {
          selector: 'input[placeholder="Skriv en kommentar…"]',
          value: "Jeg indkalder til kickoff i denne uge 🚀",
        },
      ],
      // Det nye projekt fødes uden kommentarer, så tjekket kan være absolut.
      naarKlar: (nu) => nu.antalProjektKommentarer > 0,
    },
    {
      find: () =>
        ([...document.querySelectorAll<HTMLElement>("h2")]
          .find((h) => h.textContent === "Fremgang")
          ?.closest(".rounded-2xl") as HTMLElement | null) ?? null,
      titel: "Flyt projektet fremad",
      tekst:
        "Projekter bevæger sig gennem stadier frem mod mål-linjen. Prøv: klik på »I gang« for at flytte projektet til næste stadie.",
      naarKlar: (nu) =>
        !!nu.projektStatus &&
        nu.projektStatus !== projektStartStatusRef.current,
    },

    // ---------- FASE 5: Engagement ----------
    {
      rute: () => "/leaderboard",
      find: dataTour("leaderboard"),
      titel: "Innovation som holdsport 🏆",
      tekst:
        "Alle handlinger tæller mod niveauer, som rangerer leaderboardet — og der er mærker at samle. Synligheden gør det motiverende at bidrage, og lederen kan følge engagementet. Du er nu klar til at udforske Spire på egen hånd!",
      manuel: true,
      knap: "Afslut rundvisning",
    },
  ]).current;

  const foerRef = useRef<Snapshot>(lavSnapshot());
  const fuldfoertRef = useRef(false);

  const start = useCallback(() => {
    try {
      sessionStorage.setItem("spire.landet", "1");
    } catch {
      // ignorér
    }
    nyIdeIdRef.current = null;
    nyProjektIdRef.current = null;
    projektStartStatusRef.current = null;
    const s = lavSnapshot();
    startFoerRef.current = {
      antalIdeer: s.antalIdeer,
      antalAfviste: s.antalAfviste,
      antalProjekter: s.antalProjekter,
    };
    setTrin(0);
    setAktiv(true);
  }, [lavSnapshot]);

  const slut = useCallback(() => {
    try {
      localStorage.setItem(RUNDVISNING_KEY, "faerdig");
    } catch {
      // ignorér
    }
    setAktiv(false);
    setRect(null);
    if (rolleRef.current !== "medarbejder") saetRolle("medarbejder");
    router.push("/");
  }, [saetRolle, router]);

  const videre = useCallback(() => {
    setTrin((t) => {
      if (t >= trinListe.length - 1) return t;
      return t + 1;
    });
  }, [trinListe]);

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

  // Manuel (gen)start via event — "Se rundvisningen"-knappen i sidemenuen.
  useEffect(() => {
    const handler = () => start();
    window.addEventListener(RUNDVISNING_EVENT, handler);
    return () => window.removeEventListener(RUNDVISNING_EVENT, handler);
  }, [start]);

  // Kør det aktive trin: rolle/navigation, spotlight-tracking, udfyldning og fuldførelses-tjek.
  useEffect(() => {
    if (!aktiv) return;
    const s = trinListe[trin];
    if (!s) return;

    if (s.rolle && rolleRef.current !== s.rolle) saetRolle(s.rolle);
    if (s.rute) router.push(s.rute());

    foerRef.current = lavSnapshot();
    fuldfoertRef.current = false;
    setRect(null);

    let element: HTMLElement | null = null;
    let scrollet = false;
    let udfyldt = false;

    const tick = () => {
      // 1) Find + følg elementet
      const fundet = s.find();
      if (fundet !== element) {
        element = fundet;
        scrollet = false;
      }
      if (element && element.isConnected) {
        if (!scrollet) {
          element.scrollIntoView({ block: "center", behavior: "smooth" });
          scrollet = true;
        }
        const r = element.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }

      // 2) Udfyld eksempeltekster (én gang, når alle felter findes)
      if (s.udfyld && !udfyldt) {
        const felter = s.udfyld.map((u) => ({
          el: document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            u.selector,
          ),
          value: u.value,
        }));
        if (felter.every((f) => f.el)) {
          felter.forEach((f) => udfyldFelt(f.el!, f.value));
          udfyldt = true;
        }
      }

      // 3) Er handlingen udført?
      if (s.naarKlar && !fuldfoertRef.current) {
        if (s.naarKlar(lavSnapshot(), foerRef.current, pathnameRef.current)) {
          fuldfoertRef.current = true;
          s.vedFuldfoert?.();
          setTrin((t) => Math.min(t + 1, trinListe.length - 1));
        }
      }
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [aktiv, trin, trinListe, router, saetRolle, lavSnapshot]);

  if (!mounted || !aktiv) return null;
  const s = trinListe[trin];
  const sidste = trin === trinListe.length - 1;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Mørkt bagtæppe med spotlight-hul over fokus-elementet */}
      {rect ? (
        <div
          className="absolute rounded-2xl transition-all duration-300"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow:
              "0 0 0 3px rgba(129,140,248,0.9), 0 0 0 9999px rgba(15,23,42,0.6)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/60" />
      )}

      {/* Trin-kort */}
      <div
        key={trin}
        className="pointer-events-auto fixed bottom-5 left-4 right-4 animate-fade-in rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:left-auto sm:right-6 sm:w-[24rem]"
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

        {/* Fremdriftsbar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
            style={{ width: `${((trin + 1) / trinListe.length) * 100}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={slut}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Spring over
          </button>
          {s.manuel ? (
            <Button onClick={sidste ? slut : videre}>
              {sidste ? <Check size={14} /> : null}
              {s.knap ?? "Videre"}
              {sidste ? null : <ArrowRight size={14} />}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              <MousePointerClick size={13} className="animate-pulse" />
              Din tur — følg instruktionen
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
