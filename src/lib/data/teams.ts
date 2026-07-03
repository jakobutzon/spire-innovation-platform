import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "p-pant",
    navn: "Pant på returkasser",
    beskrivelse:
      "Pilotforsøg med pantordning på transportemballage sammen med tre store leverandører.",
    ideId: "i-genbrug",
    status: "i-gang",
    medlemIds: ["u-omar", "u-laila", "u-anders"],
    leadId: "u-omar",
    startet: "2026-06-15",
    opgaver: [
      { id: "o-pant-1", tekst: "Aftale pantsats med leverandører", faerdig: true },
      { id: "o-pant-2", tekst: "Mærke de første 200 kasser", faerdig: false },
      { id: "o-pant-3", tekst: "Opsætte registrering ved retur", faerdig: false },
    ],
    kommentarer: [
      {
        id: "pk-pant-1",
        forfatterId: "u-laila",
        tekst: "Jeg har trukket baseline-tal på returprocenten, så vi kan måle effekten.",
        oprettet: "2026-06-24T10:15:00Z",
      },
    ],
  },
  {
    id: "p-abonnement",
    navn: "Abonnement på flagskibsprodukt",
    beskrivelse:
      "Udvikling og lancering af en abonnementsmodel med automatisk genbestilling for vores mest solgte produkt.",
    ideId: "i-abonnement",
    status: "afventer-feedback",
    medlemIds: ["u-mette", "u-trine", "u-peter", "u-anders"],
    leadId: "u-mette",
    startet: "2026-05-08",
    opgaver: [
      { id: "o-abon-1", tekst: "Design af abonnementsflow", faerdig: true },
      { id: "o-abon-2", tekst: "Integration med betalingssystem", faerdig: true },
      { id: "o-abon-3", tekst: "Indsamle feedback fra pilotkunder", faerdig: false },
    ],
    kommentarer: [],
  },
  {
    id: "p-onboarding",
    navn: "Selvbetjent kundeonboarding",
    beskrivelse:
      "Guidet selvbetjeningsflow, der reducerer opsætningstid fra dage til minutter.",
    ideId: "i-onboarding",
    status: "faerdig",
    udfald: "succesfuld",
    medlemIds: ["u-jonas", "u-peter", "u-trine"],
    leadId: "u-jonas",
    startet: "2026-06-22",
    opgaver: [],
    kommentarer: [],
  },
  {
    id: "p-ai-support",
    navn: "AI-supportassistent (intern)",
    beskrivelse:
      "Proof of concept for en intern AI-assistent, der svarer på spørgsmål ud fra virksomhedens wiki.",
    ideId: "i-aichat",
    status: "skal-laves",
    medlemIds: ["u-peter", "u-sara", "u-laila"],
    leadId: "u-peter",
    startet: "2026-06-26",
    opgaver: [
      { id: "o-ai-1", tekst: "Afklare hvilke wiki-sider der skal indekseres", faerdig: false },
      { id: "o-ai-2", tekst: "Vælge model og opsætte prototype", faerdig: false },
    ],
    kommentarer: [
      {
        id: "pk-ai-1",
        forfatterId: "u-sara",
        tekst: "Vi bør starte med de mest besøgte supportsider som datagrundlag.",
        oprettet: "2026-06-27T08:40:00Z",
      },
    ],
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** Find det projekt, en idé er blevet eksekveret som (hvis noget). */
export function getProjectByIde(ideId: string): Project | undefined {
  return projects.find((p) => p.ideId === ideId);
}
