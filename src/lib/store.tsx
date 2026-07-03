"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Idea,
  IdeStatus,
  Kategori,
  Project,
  ProjektStadie,
  ProjektUdfald,
  Rolle,
  User,
} from "@/lib/types";
import { ideas as seedIdeas } from "@/lib/data/ideas";
import {
  kategorier as seedKategorier,
  KATEGORI_PALETTE,
  ANDET_ID,
} from "@/lib/data/kategorier";
import { projects as seedProjects } from "@/lib/data/teams";
import { stadier as seedStadier } from "@/lib/data/stadier";
import { users, demoBrugerePerRolle, getUser } from "@/lib/data/users";
import { niveauAf, fremgangINiveau } from "@/lib/niveau";

const ROLLE_KEY = "spire.rolle";
const PROFIL_KEY = "spire.profil";

interface Fremgang {
  nonce: number;
  /** Udløste denne opgave et niveau-op (til fejring)? */
  niveauSteg: boolean;
}

interface AppState {
  rolle: Rolle;
  currentUser: User;
  saetRolle: (r: Rolle) => void;
  /** Opdatér den aktuelle brugers profil (navn/titel/afdeling/farve/billede). Persisteres lokalt. */
  opdaterProfil: (felter: Partial<User>) => void;

  /** Aktuel brugers samlede erfaring (basis + optjent i sessionen). */
  visErfaring: number;
  /** Aktuelt niveau, udledt af visErfaring. */
  niveau: number;
  /** Hvor langt inde i nuværende niveau (0-4 ud af 5 opgaver). */
  niveauFremgang: number;
  /** Seneste opgave-fuldførelse — trigger til instant feedback/fejring. */
  fremgang: Fremgang;

  ideas: Idea[];
  stem: (ideId: string) => void;
  springOver: (ideId: string) => void;
  harStemt: (ideId: string) => boolean;
  harSprunget: (ideId: string) => boolean;
  erBesluttet: (ideId: string) => boolean;
  tilfoejIde: (input: {
    titel: string;
    beskrivelse: string;
    kategoriId: string;
  }) => string;
  saetStatus: (ideId: string, status: IdeStatus) => void;
  /** Redigér titel/beskrivelse på en idé (kun idéens forfatter må kalde dette fra UI). */
  redigerIde: (ideId: string, titel: string, beskrivelse: string) => void;
  /** Slet en idé permanent (kun forfatter eller leder må kalde dette fra UI). */
  sletIde: (ideId: string) => void;
  tilfoejKommentar: (ideId: string, tekst: string) => void;
  /** Upvote/fjern upvote på en kommentar (giver ingen niveau-fremgang). */
  stemKommentar: (ideId: string, kommentarId: string) => void;
  harStemtKommentar: (ideId: string, kommentarId: string) => boolean;
  /** Redigér teksten på en kommentar (kun kommentarens forfatter må kalde dette fra UI). */
  redigerKommentar: (ideId: string, kommentarId: string, tekst: string) => void;
  /** Slet en kommentar (kun kommentarens forfatter må kalde dette fra UI). */
  sletKommentar: (ideId: string, kommentarId: string) => void;

  kategorier: Kategori[];
  getKategori: (id: string) => Kategori | undefined;
  /** Leder-admin af kategorier. "Andet" er beskyttet mod sletning. */
  tilfoejKategori: (navn: string) => void;
  redigerKategori: (id: string, navn: string) => void;
  saetKategoriFarve: (id: string, chipFarve: string) => void;
  sletKategori: (id: string) => void;
  /** Flyt en kategori et trin op/ned (kan ikke overhale "Andet"). */
  flytKategori: (id: string, retning: "op" | "ned") => void;

  projects: Project[];
  getProject: (id: string) => Project | undefined;
  getProjectByIde: (ideId: string) => Project | undefined;
  /** Send en idé videre til et projekt (opretter projekt m. idémager som lead). */
  sendTilProjekt: (ideId: string) => void;
  /** Afvis en idé; begrundelsen gemmes som en fremhævet kommentar på idéen. */
  afvisIde: (ideId: string, begrundelse: string) => void;
  /** Flyt et projekt til et andet stadie på eksekverings-boardet. */
  flytProjekt: (projektId: string, status: string) => void;
  /** Markér et færdigt projekt som succesfuldt eller ej. */
  saetProjektUdfald: (projektId: string, udfald: ProjektUdfald) => void;
  /** Tilføj en to-do til et projekts opgaveliste. */
  tilfoejOpgave: (projektId: string, tekst: string) => void;
  /** Slå en opgaves færdig-status til/fra. */
  skiftOpgave: (projektId: string, opgaveId: string) => void;
  /** Slet en opgave fra et projekt. */
  sletOpgave: (projektId: string, opgaveId: string) => void;
  /** Tilføj en kommentar til et projekts arbejdstråd. */
  tilfoejProjektKommentar: (projektId: string, tekst: string) => void;
  /** Slet en projektkommentar (kun forfatteren fra UI). */
  sletProjektKommentar: (projektId: string, kommentarId: string) => void;

  /** Stadierne på eksekverings-boardet, i rækkefølge. Sidste = mål-linjen. */
  stadier: ProjektStadie[];
  getStadie: (id: string) => ProjektStadie | undefined;
  /** Leder-admin af stadier. Mindst 2 skal altid være tilbage. */
  tilfoejStadie: (navn: string) => void;
  redigerStadie: (id: string, navn: string) => void;
  sletStadie: (id: string) => void;
  /** Flyt et stadie et trin op/ned — ændrer rækkefølgen på projekt-boardet. */
  flytStadie: (id: string, retning: "op" | "ned") => void;
}

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [rolle, setRolle] = useState<Rolle>("medarbejder");
  const [ideas, setIdeas] = useState<Idea[]>(seedIdeas);
  const [kategorier, setKategorier] = useState<Kategori[]>(seedKategorier);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [stadier, setStadier] = useState<ProjektStadie[]>(seedStadier);
  const [bonusErfaring, setBonusErfaring] = useState<Record<string, number>>({});
  const [profilOverlay, setProfilOverlay] = useState<
    Record<string, Partial<User>>
  >({});
  const [fremgang, setFremgang] = useState<Fremgang>({
    nonce: 0,
    niveauSteg: false,
  });

  // Hent gemt rolle + profil-overlay ved opstart (kun klient).
  useEffect(() => {
    const gemt = window.localStorage.getItem(ROLLE_KEY) as Rolle | null;
    if (gemt === "medarbejder" || gemt === "leder" || gemt === "admin") {
      setRolle(gemt);
    }
    try {
      const gemtProfil = window.localStorage.getItem(PROFIL_KEY);
      if (gemtProfil) setProfilOverlay(JSON.parse(gemtProfil));
    } catch {
      // ignorér korrupt localStorage
    }
  }, []);

  const saetRolle = useCallback((r: Rolle) => {
    setRolle(r);
    window.localStorage.setItem(ROLLE_KEY, r);
  }, []);

  const currentUser = useMemo(() => {
    const basis = getUser(demoBrugerePerRolle[rolle]) ?? users[0];
    const overlay = profilOverlay[basis.id];
    return overlay ? { ...basis, ...overlay } : basis;
  }, [rolle, profilOverlay]);

  const opdaterProfil = useCallback(
    (felter: Partial<User>) => {
      const id = getUser(demoBrugerePerRolle[rolle])?.id ?? users[0].id;
      setProfilOverlay((prev) => {
        const naeste = { ...prev, [id]: { ...prev[id], ...felter } };
        try {
          window.localStorage.setItem(PROFIL_KEY, JSON.stringify(naeste));
        } catch {
          // ignorér quota-fejl (fx meget stort billede)
        }
        return naeste;
      });
    },
    [rolle],
  );

  const visErfaring =
    currentUser.erfaring + (bonusErfaring[currentUser.id] ?? 0);
  const niveau = niveauAf(visErfaring);
  const niveauFremgang = fremgangINiveau(visErfaring);

  /** Registrér en fuldført opgave for den aktuelle bruger og udløs feedback/fejring. */
  const fuldfoerOpgave = useCallback(() => {
    const foerErfaring =
      currentUser.erfaring + (bonusErfaring[currentUser.id] ?? 0);
    const efterErfaring = foerErfaring + 1;
    const steg = niveauAf(efterErfaring) > niveauAf(foerErfaring);
    setBonusErfaring((prev) => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] ?? 0) + 1,
    }));
    setFremgang((prev) => ({ nonce: prev.nonce + 1, niveauSteg: steg }));
  }, [currentUser.id, currentUser.erfaring, bonusErfaring]);

  const harStemt = useCallback(
    (ideId: string) =>
      ideas.find((i) => i.id === ideId)?.stemtAf.includes(currentUser.id) ??
      false,
    [ideas, currentUser.id],
  );

  const harSprunget = useCallback(
    (ideId: string) =>
      ideas.find((i) => i.id === ideId)?.sprungetOver.includes(currentUser.id) ??
      false,
    [ideas, currentUser.id],
  );

  const erBesluttet = useCallback(
    (ideId: string) => harStemt(ideId) || harSprunget(ideId),
    [harStemt, harSprunget],
  );

  const stem = useCallback(
    (ideId: string) => {
      const uid = currentUser.id;
      let belon = false;
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== ideId) return i;
          const varBesluttet =
            i.stemtAf.includes(uid) || i.sprungetOver.includes(uid);
          const harStemtNu = i.stemtAf.includes(uid);
          // +opgave kun ved første stillingtagen, og ikke på egen idé
          belon = !varBesluttet && i.forfatterId !== uid;
          return {
            ...i,
            stemmer: harStemtNu ? i.stemmer - 1 : i.stemmer + 1,
            stemtAf: harStemtNu
              ? i.stemtAf.filter((id) => id !== uid)
              : [...i.stemtAf, uid],
            // upvote og spring-over er gensidigt udelukkende
            sprungetOver: i.sprungetOver.filter((id) => id !== uid),
          };
        }),
      );
      if (belon) fuldfoerOpgave();
    },
    [currentUser.id, fuldfoerOpgave],
  );

  const springOver = useCallback(
    (ideId: string) => {
      const uid = currentUser.id;
      let belon = false;
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== ideId) return i;
          const varBesluttet =
            i.stemtAf.includes(uid) || i.sprungetOver.includes(uid);
          const harSprungetNu = i.sprungetOver.includes(uid);
          belon = !varBesluttet && i.forfatterId !== uid;
          const fjernedeStemme = i.stemtAf.includes(uid);
          return {
            ...i,
            stemmer: fjernedeStemme ? i.stemmer - 1 : i.stemmer,
            stemtAf: i.stemtAf.filter((id) => id !== uid),
            sprungetOver: harSprungetNu
              ? i.sprungetOver.filter((id) => id !== uid)
              : [...i.sprungetOver, uid],
          };
        }),
      );
      if (belon) fuldfoerOpgave();
    },
    [currentUser.id, fuldfoerOpgave],
  );

  const tilfoejIde = useCallback<AppState["tilfoejIde"]>(
    (input) => {
      const id = `i-${Date.now().toString(36)}`;
      const ny: Idea = {
        id,
        titel: input.titel,
        beskrivelse: input.beskrivelse,
        forfatterId: currentUser.id,
        kategoriId: input.kategoriId,
        status: "ny",
        stemmer: 1,
        stemtAf: [currentUser.id],
        sprungetOver: [],
        kommentarer: [],
        oprettet: new Date().toISOString(),
      };
      setIdeas((prev) => [ny, ...prev]);
      fuldfoerOpgave();
      return id;
    },
    [currentUser.id, fuldfoerOpgave],
  );

  const saetStatus = useCallback((ideId: string, status: IdeStatus) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideId ? { ...i, status } : i)),
    );
  }, []);

  const redigerIde = useCallback(
    (ideId: string, titel: string, beskrivelse: string) => {
      const t = titel.trim();
      const b = beskrivelse.trim();
      if (!t || !b) return;
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideId ? { ...i, titel: t, beskrivelse: b } : i,
        ),
      );
    },
    [],
  );

  const sletIde = useCallback((ideId: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== ideId));
  }, []);

  const tilfoejKommentar = useCallback(
    (ideId: string, tekst: string) => {
      const idea = ideas.find((i) => i.id === ideId);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideId
            ? {
                ...i,
                kommentarer: [
                  ...i.kommentarer,
                  {
                    id: `k-${Date.now().toString(36)}`,
                    forfatterId: currentUser.id,
                    tekst,
                    stemmer: 0,
                    stemtAf: [],
                    oprettet: new Date().toISOString(),
                  },
                ],
              }
            : i,
        ),
      );
      // +opgave for at kommentere på en andens idé (ikke på sin egen).
      if (idea && idea.forfatterId !== currentUser.id) fuldfoerOpgave();
    },
    [currentUser.id, ideas, fuldfoerOpgave],
  );

  const stemKommentar = useCallback(
    (ideId: string, kommentarId: string) => {
      const uid = currentUser.id;
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== ideId) return i;
          return {
            ...i,
            kommentarer: i.kommentarer.map((k) => {
              if (k.id !== kommentarId) return k;
              const harStemt = k.stemtAf.includes(uid);
              return {
                ...k,
                stemmer: harStemt ? k.stemmer - 1 : k.stemmer + 1,
                stemtAf: harStemt
                  ? k.stemtAf.filter((id) => id !== uid)
                  : [...k.stemtAf, uid],
              };
            }),
          };
        }),
      );
      // Bemærk: kommentar-upvotes giver bevidst ingen erfaring/niveau-fremgang.
    },
    [currentUser.id],
  );

  const redigerKommentar = useCallback(
    (ideId: string, kommentarId: string, tekst: string) => {
      const t = tekst.trim();
      if (!t) return;
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideId
            ? {
                ...i,
                kommentarer: i.kommentarer.map((k) =>
                  k.id === kommentarId ? { ...k, tekst: t } : k,
                ),
              }
            : i,
        ),
      );
    },
    [],
  );

  const sletKommentar = useCallback((ideId: string, kommentarId: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === ideId
          ? {
              ...i,
              kommentarer: i.kommentarer.filter((k) => k.id !== kommentarId),
            }
          : i,
      ),
    );
  }, []);

  const harStemtKommentar = useCallback(
    (ideId: string, kommentarId: string) =>
      ideas
        .find((i) => i.id === ideId)
        ?.kommentarer.find((k) => k.id === kommentarId)
        ?.stemtAf.includes(currentUser.id) ?? false,
    [ideas, currentUser.id],
  );

  const getKategori = useCallback(
    (id: string) => kategorier.find((k) => k.id === id),
    [kategorier],
  );

  const tilfoejKategori = useCallback((navn: string) => {
    const rent = navn.trim();
    if (!rent) return;
    setKategorier((prev) => {
      const farve = KATEGORI_PALETTE[prev.length % KATEGORI_PALETTE.length];
      const ny: Kategori = {
        id: `k-${Date.now().toString(36)}`,
        navn: rent,
        chipFarve: farve,
      };
      // Hold "Andet" nederst i listen.
      const udenAndet = prev.filter((k) => k.id !== ANDET_ID);
      const andet = prev.find((k) => k.id === ANDET_ID);
      return andet ? [...udenAndet, ny, andet] : [...prev, ny];
    });
  }, []);

  const redigerKategori = useCallback((id: string, navn: string) => {
    const rent = navn.trim();
    if (!rent) return;
    setKategorier((prev) =>
      prev.map((k) => (k.id === id ? { ...k, navn: rent } : k)),
    );
  }, []);

  const saetKategoriFarve = useCallback((id: string, chipFarve: string) => {
    setKategorier((prev) =>
      prev.map((k) => (k.id === id ? { ...k, chipFarve } : k)),
    );
  }, []);

  const sletKategori = useCallback((id: string) => {
    if (id === ANDET_ID) return; // "Andet" er beskyttet
    setKategorier((prev) => prev.filter((k) => k.id !== id));
    // Flyt berørte idéer til "Andet".
    setIdeas((prev) =>
      prev.map((i) => (i.kategoriId === id ? { ...i, kategoriId: ANDET_ID } : i)),
    );
  }, []);

  const flytKategori = useCallback((id: string, retning: "op" | "ned") => {
    if (id === ANDET_ID) return; // "Andet" er fast og kan ikke flyttes
    setKategorier((prev) => {
      const fra = prev.findIndex((k) => k.id === id);
      if (fra === -1) return prev;
      const til = retning === "op" ? fra - 1 : fra + 1;
      if (til < 0 || til >= prev.length) return prev;
      if (prev[til].id === ANDET_ID) return prev; // må ikke overhale "Andet"
      const kopi = [...prev];
      [kopi[fra], kopi[til]] = [kopi[til], kopi[fra]];
      return kopi;
    });
  }, []);

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const getProjectByIde = useCallback(
    (ideId: string) => projects.find((p) => p.ideId === ideId),
    [projects],
  );

  const sendTilProjekt = useCallback(
    (ideId: string) => {
      const idea = ideas.find((i) => i.id === ideId);
      if (!idea) return;
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideId ? { ...i, status: "i-projekt" } : i)),
      );
      setProjects((prev) => {
        if (prev.some((p) => p.ideId === ideId)) return prev; // undgå dublet
        const ny: Project = {
          id: `p-${Date.now().toString(36)}`,
          navn: idea.titel,
          beskrivelse: idea.beskrivelse,
          ideId: idea.id,
          status: stadier[0]?.id ?? "skal-laves",
          medlemIds: [idea.forfatterId],
          leadId: idea.forfatterId, // idémageren følger med som lead
          startet: new Date().toISOString().slice(0, 10),
          opgaver: [],
          kommentarer: [],
        };
        return [ny, ...prev];
      });
    },
    [ideas, stadier],
  );

  const afvisIde = useCallback(
    (ideId: string, begrundelse: string) => {
      const idea = ideas.find((i) => i.id === ideId);
      const tekst = begrundelse.trim();
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id !== ideId) return i;
          return {
            ...i,
            status: "afvist",
            kommentarer: tekst
              ? [
                  ...i.kommentarer,
                  {
                    id: `k-${Date.now().toString(36)}`,
                    forfatterId: currentUser.id,
                    tekst,
                    stemmer: 0,
                    stemtAf: [],
                    oprettet: new Date().toISOString(),
                    erBegrundelse: true,
                  },
                ]
              : i.kommentarer,
          };
        }),
      );
      // +opgave for at give feedback på en andens idé (ikke på sin egen).
      if (tekst && idea && idea.forfatterId !== currentUser.id) fuldfoerOpgave();
    },
    [ideas, currentUser.id, fuldfoerOpgave],
  );

  const flytProjekt = useCallback(
    (projektId: string, status: string) => {
      const sidsteStadieId = stadier[stadier.length - 1]?.id;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projektId
            ? {
                ...p,
                status,
                // Ryd udfaldet hvis projektet flyttes væk fra mål-linjen igen.
                udfald: status === sidsteStadieId ? p.udfald : undefined,
              }
            : p,
        ),
      );
    },
    [stadier],
  );

  const saetProjektUdfald = useCallback(
    (projektId: string, udfald: ProjektUdfald) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projektId ? { ...p, udfald } : p)),
      );
    },
    [],
  );

  const tilfoejOpgave = useCallback((projektId: string, tekst: string) => {
    const t = tekst.trim();
    if (!t) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projektId
          ? {
              ...p,
              opgaver: [
                ...p.opgaver,
                { id: `o-${Date.now().toString(36)}`, tekst: t, faerdig: false },
              ],
            }
          : p,
      ),
    );
  }, []);

  const skiftOpgave = useCallback((projektId: string, opgaveId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projektId
          ? {
              ...p,
              opgaver: p.opgaver.map((o) =>
                o.id === opgaveId ? { ...o, faerdig: !o.faerdig } : o,
              ),
            }
          : p,
      ),
    );
  }, []);

  const sletOpgave = useCallback((projektId: string, opgaveId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projektId
          ? { ...p, opgaver: p.opgaver.filter((o) => o.id !== opgaveId) }
          : p,
      ),
    );
  }, []);

  const tilfoejProjektKommentar = useCallback(
    (projektId: string, tekst: string) => {
      const t = tekst.trim();
      if (!t) return;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projektId
            ? {
                ...p,
                kommentarer: [
                  ...p.kommentarer,
                  {
                    id: `pk-${Date.now().toString(36)}`,
                    forfatterId: currentUser.id,
                    tekst: t,
                    oprettet: new Date().toISOString(),
                  },
                ],
              }
            : p,
        ),
      );
    },
    [currentUser.id],
  );

  const sletProjektKommentar = useCallback(
    (projektId: string, kommentarId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projektId
            ? {
                ...p,
                kommentarer: p.kommentarer.filter((k) => k.id !== kommentarId),
              }
            : p,
        ),
      );
    },
    [],
  );

  const getStadie = useCallback(
    (id: string) => stadier.find((s) => s.id === id),
    [stadier],
  );

  const tilfoejStadie = useCallback((navn: string) => {
    const rent = navn.trim();
    if (!rent) return;
    setStadier((prev) => {
      const ny: ProjektStadie = { id: `st-${Date.now().toString(36)}`, navn: rent };
      if (prev.length === 0) return [ny];
      // Indsæt lige før det sidste stadie, så mål-linjen forbliver sidst.
      return [...prev.slice(0, -1), ny, prev[prev.length - 1]];
    });
  }, []);

  const redigerStadie = useCallback((id: string, navn: string) => {
    const rent = navn.trim();
    if (!rent) return;
    setStadier((prev) => prev.map((s) => (s.id === id ? { ...s, navn: rent } : s)));
  }, []);

  const sletStadie = useCallback(
    (id: string) => {
      if (stadier.length <= 2) return; // mindst 2 stadier skal blive tilbage
      const index = stadier.findIndex((s) => s.id === id);
      if (index === -1) return;
      const naboId = stadier[index - 1]?.id ?? stadier[index + 1]?.id;
      setStadier((prev) => prev.filter((s) => s.id !== id));
      if (naboId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.status === id ? { ...p, status: naboId, udfald: undefined } : p,
          ),
        );
      }
    },
    [stadier],
  );

  const flytStadie = useCallback((id: string, retning: "op" | "ned") => {
    setStadier((prev) => {
      const fra = prev.findIndex((s) => s.id === id);
      if (fra === -1) return prev;
      const til = retning === "op" ? fra - 1 : fra + 1;
      if (til < 0 || til >= prev.length) return prev;
      const kopi = [...prev];
      [kopi[fra], kopi[til]] = [kopi[til], kopi[fra]];
      return kopi;
    });
  }, []);

  const value: AppState = {
    rolle,
    currentUser,
    saetRolle,
    opdaterProfil,
    visErfaring,
    niveau,
    niveauFremgang,
    fremgang,
    ideas,
    stem,
    springOver,
    harStemt,
    harSprunget,
    erBesluttet,
    tilfoejIde,
    saetStatus,
    redigerIde,
    sletIde,
    tilfoejKommentar,
    stemKommentar,
    harStemtKommentar,
    redigerKommentar,
    sletKommentar,
    kategorier,
    getKategori,
    tilfoejKategori,
    redigerKategori,
    saetKategoriFarve,
    sletKategori,
    flytKategori,
    projects,
    getProject,
    getProjectByIde,
    sendTilProjekt,
    afvisIde,
    flytProjekt,
    saetProjektUdfald,
    tilfoejOpgave,
    skiftOpgave,
    sletOpgave,
    tilfoejProjektKommentar,
    sletProjektKommentar,
    stadier,
    getStadie,
    tilfoejStadie,
    redigerStadie,
    sletStadie,
    flytStadie,
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useStore(): AppState {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useStore skal bruges inden i en AppStoreProvider");
  }
  return ctx;
}

/** Må denne rolle udføre ledelses-/administrationshandlinger? */
export function kanStyre(rolle: Rolle): boolean {
  return rolle === "leder" || rolle === "admin";
}
