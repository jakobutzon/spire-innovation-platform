import type { Idea } from "@/lib/types";

export const ideas: Idea[] = [
  {
    id: "i-genbrug",
    titel: "Pantordning på vores transportemballage",
    beskrivelse:
      "I dag smider vi tusindvis af engangskasser ud hvert år. Hvis vi indfører en pantordning på returkasser med leverandørerne, kan vi genbruge dem mange gange og spare både penge og CO₂. Et lille depositum giver alle et incitament til at sende kasserne retur.",
    forfatterId: "u-omar",
    kategoriId: "k-baeredygtig",
    status: "i-projekt",
    stemmer: 47,
    stemtAf: ["u-mette", "u-anders", "u-laila", "u-peter"],
    sprungetOver: ["u-jonas"],
    kommentarer: [
      {
        id: "k1",
        stemmer: 6,
        stemtAf: ["u-mette", "u-peter"],
        forfatterId: "u-laila",
        tekst:
          "Elsker det. Vi har data på antal forsendelser — jeg kan hjælpe med at beregne besparelsen.",
        oprettet: "2026-06-12T09:20:00Z",
      },
      {
        id: "k2",
        stemmer: 11,
        stemtAf: ["u-mette", "u-laila", "u-omar"],
        forfatterId: "u-anders",
        tekst: "Stærk business case. Lad os teste det med vores tre største leverandører.",
        oprettet: "2026-06-14T11:05:00Z",
      },
    ],
    oprettet: "2026-06-10T08:00:00Z",
  },
  {
    id: "i-onboarding",
    titel: "Selvbetjent onboarding for nye kunder",
    beskrivelse:
      "Nye kunder venter i gennemsnit to dage på manuel opsætning. En guidet selvbetjeningsflow med tjekliste og videoer kan bringe det ned til minutter og aflaste kundeservice markant.",
    forfatterId: "u-jonas",
    kategoriId: "k-kundeoplevelse",
    status: "i-projekt",
    stemmer: 38,
    stemtAf: ["u-mette", "u-trine", "u-peter"],
    sprungetOver: [],
    kommentarer: [
      {
        id: "k3",
        stemmer: 4,
        stemtAf: ["u-peter"],
        forfatterId: "u-trine",
        tekst: "Det her rammer lige plet på kundeoplevelsen. Godt set, Jonas.",
        oprettet: "2026-06-18T14:30:00Z",
      },
    ],
    oprettet: "2026-06-16T10:15:00Z",
  },
  {
    id: "i-aichat",
    titel: "AI-assistent til interne supportspørgsmål",
    beskrivelse:
      "En chatbot trænet på vores interne wiki og politikker, så kolleger kan få svar med det samme i stedet for at vente på HR eller IT. Det sparer tid på begge sider af bordet.",
    forfatterId: "u-peter",
    kategoriId: "k-effektivisering",
    status: "i-projekt",
    stemmer: 31,
    stemtAf: ["u-laila", "u-mette"],
    sprungetOver: ["u-omar"],
    kommentarer: [
      {
        id: "k4",
        stemmer: 3,
        stemtAf: ["u-laila"],
        forfatterId: "u-sara",
        tekst: "Vi skal være skarpe på datasikkerhed, men potentialet er stort.",
        oprettet: "2026-06-22T08:45:00Z",
      },
    ],
    oprettet: "2026-06-20T12:00:00Z",
  },
  {
    id: "i-rute",
    titel: "Dynamisk ruteplanlægning for leveringer",
    beskrivelse:
      "Ved at samle leveringer i samme område og optimere ruterne i realtid kan vi reducere antallet af kørte kilometer og levere hurtigere. Mindre brændstof, gladere kunder.",
    forfatterId: "u-omar",
    kategoriId: "k-baeredygtig",
    status: "under-vurdering",
    stemmer: 26,
    stemtAf: ["u-anders", "u-laila"],
    sprungetOver: [],
    kommentarer: [
      {
        id: "k7",
        stemmer: 9,
        stemtAf: ["u-mette", "u-peter", "u-anders"],
        forfatterId: "u-laila",
        tekst:
          "Vi har GPS-data på alle ruter — lad os teste effekten på ét distrikt først, så har vi tal at gå videre med.",
        oprettet: "2026-06-23T10:00:00Z",
      },
      {
        id: "k8",
        stemmer: 3,
        stemtAf: ["u-omar"],
        forfatterId: "u-trine",
        tekst: "Husk kundekommunikation om ændrede leveringstider undervejs.",
        oprettet: "2026-06-24T08:30:00Z",
      },
    ],
    oprettet: "2026-06-21T09:30:00Z",
  },
  {
    id: "i-abonnement",
    titel: "Abonnementsmodel på vores mest solgte produkt",
    beskrivelse:
      "I stedet for engangskøb kunne vi tilbyde et abonnement med automatisk genbestilling. Det giver tilbagevendende omsætning og binder kunderne tættere til os.",
    forfatterId: "u-mette",
    kategoriId: "k-produkter",
    status: "i-projekt",
    stemmer: 52,
    stemtAf: ["u-anders", "u-trine", "u-jonas", "u-peter", "u-laila"],
    sprungetOver: [],
    kommentarer: [
      {
        id: "k5",
        stemmer: 7,
        stemtAf: ["u-trine", "u-mette"],
        forfatterId: "u-anders",
        tekst: "Den her fik flest upvotes. Nu kører den som projekt.",
        oprettet: "2026-05-05T10:00:00Z",
      },
    ],
    oprettet: "2026-04-20T11:00:00Z",
  },
  {
    id: "i-moede",
    titel: "Mødefri torsdage",
    beskrivelse:
      "Indfør en fast ugedag uden interne møder, så folk har sammenhængende tid til fordybelse. Simpelt at prøve af, og kan gøre stor forskel for produktiviteten.",
    forfatterId: "u-jonas",
    kategoriId: "k-effektivisering",
    status: "afvist",
    stemmer: 19,
    stemtAf: ["u-mette"],
    sprungetOver: ["u-anders", "u-peter"],
    kommentarer: [
      {
        id: "k6",
        stemmer: 2,
        stemtAf: [],
        forfatterId: "u-anders",
        tekst:
          "God tanke, men svær at gennemføre på tværs af alle afdelinger lige nu. Vi parkerer den.",
        oprettet: "2026-06-25T15:20:00Z",
      },
    ],
    oprettet: "2026-06-19T13:40:00Z",
  },
  {
    id: "i-app",
    titel: "Mobilapp til selvbetjening for kunder",
    beskrivelse:
      "En enkel app, hvor kunderne selv kan se ordrer, status og fakturaer. Det reducerer henvendelser og giver en mere moderne oplevelse.",
    forfatterId: "u-peter",
    kategoriId: "k-kundeoplevelse",
    status: "ny",
    stemmer: 14,
    stemtAf: ["u-mette"],
    sprungetOver: [],
    kommentarer: [
      {
        id: "k9",
        stemmer: 5,
        stemtAf: ["u-mette", "u-jonas"],
        forfatterId: "u-jonas",
        tekst:
          "Ja tak! Kunderne spørger tit efter en app, hvor de selv kan hente fakturaer.",
        oprettet: "2026-06-29T09:00:00Z",
      },
    ],
    oprettet: "2026-06-28T07:50:00Z",
  },
  {
    id: "i-laering",
    titel: "Mikrolæring i 5 minutter om dagen",
    beskrivelse:
      "Korte daglige læringsmoduler i en app, så kompetenceudvikling bliver en vane frem for et årligt kursus. Gamificeret med streaks og badges.",
    forfatterId: "u-laila",
    kategoriId: "k-andet",
    status: "ny",
    stemmer: 22,
    stemtAf: ["u-mette", "u-jonas"],
    sprungetOver: [],
    kommentarer: [
      {
        id: "k10",
        stemmer: 0,
        stemtAf: [],
        forfatterId: "u-mette",
        tekst: "Streaks kunne kobles til vores eksisterende point-system.",
        oprettet: "2026-06-28T12:00:00Z",
      },
    ],
    oprettet: "2026-06-27T16:10:00Z",
  },
];
