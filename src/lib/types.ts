// Domænetyper for Spire innovationsplatform.
// Al feltbenævnelse er på dansk for at matche brugergrænsefladen.

export type Rolle = "medarbejder" | "leder" | "admin";

export interface Badge {
  id: string;
  navn: string;
  ikon: string; // lucide-ikon-navn
  beskrivelse: string;
}

export interface User {
  id: string;
  navn: string;
  rolle: Rolle;
  titel: string;
  afdeling: string;
  avatarFarve: string; // tailwind bg-klasse (fallback/initialer)
  avatarUrl?: string; // profilbillede (data-URL eller Storage-URL); vinder over farve
  erfaring: number; // samlet antal fuldførte opgaver (styrer niveau)
  badges: Badge[];
}

export type IdeStatus =
  | "ny"
  | "under-vurdering"
  | "godkendt"
  | "afvist"
  | "i-projekt";

export interface Kommentar {
  id: string;
  forfatterId: string;
  tekst: string;
  stemmer: number;
  stemtAf: string[]; // user-id'er der har upvotet kommentaren
  oprettet: string; // ISO
  /** Er dette lederens begrundelse for at afvise idéen? Vises altid fremhævet. */
  erBegrundelse?: boolean;
}

export interface Idea {
  id: string;
  titel: string;
  beskrivelse: string;
  forfatterId: string;
  kategoriId: string; // hvilken kategori idéen hører under (påkrævet)
  status: IdeStatus;
  stemmer: number;
  stemtAf: string[]; // user-id'er der har upvotet
  sprungetOver: string[]; // user-id'er der aktivt har sprunget idéen over
  kommentarer: Kommentar[];
  oprettet: string; // ISO
}

/** Et fast (men leder-redigerbart) emne en idé kan høre under. */
export interface Kategori {
  id: string;
  navn: string;
  chipFarve: string; // tailwind bg/text-klasser (farvekodet chip)
}

/**
 * Et trin på eksekverings-boardet (fx "Skal laves", "I gang" …). Innovation
 * (idé-vurdering, point) stopper, når en idé bliver til et projekt — herfra
 * handler det kun om at eksekvere. Lederen kan tilføje/omdøbe/slette trin;
 * det sidste trin i rækkefølgen er altid "mål-linjen", hvor et udfald sættes.
 */
export interface ProjektStadie {
  id: string;
  navn: string;
}

/** Sættes når et projekt når det sidste stadie — lykkedes det? */
export type ProjektUdfald = "succesfuld" | "ikke-succesfuld";

/** En to-do på et projekts opgaveliste. */
export interface ProjektOpgave {
  id: string;
  tekst: string;
  faerdig: boolean;
}

/** En kommentar i et projekts arbejdstråd (ingen upvotes — ren eksekvering). */
export interface ProjektKommentar {
  id: string;
  forfatterId: string;
  tekst: string;
  oprettet: string; // ISO
}

export interface Project {
  id: string;
  navn: string;
  beskrivelse: string;
  ideId?: string;
  status: string; // ProjektStadie.id
  udfald?: ProjektUdfald;
  medlemIds: string[];
  leadId: string;
  startet: string; // ISO
  opgaver: ProjektOpgave[];
  kommentarer: ProjektKommentar[];
}
