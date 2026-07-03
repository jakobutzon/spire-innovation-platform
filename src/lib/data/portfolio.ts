// Tidsserier og afledte nøgletal til porteføljedashboardet.
// Nogle tal beregnes dynamisk i selektorerne i index.ts; her ligger
// historiske serier, der ikke kan udledes af de øvrige mock-data.

export const ideerPrMaaned = [
  { maaned: "Jan", indsendt: 18, godkendt: 4 },
  { maaned: "Feb", indsendt: 23, godkendt: 6 },
  { maaned: "Mar", indsendt: 31, godkendt: 7 },
  { maaned: "Apr", indsendt: 28, godkendt: 9 },
  { maaned: "Maj", indsendt: 35, godkendt: 8 },
  { maaned: "Jun", indsendt: 42, godkendt: 11 },
];

export const deltagelsePrMaaned = [
  { maaned: "Jan", aktive: 64 },
  { maaned: "Feb", aktive: 82 },
  { maaned: "Mar", aktive: 97 },
  { maaned: "Apr", aktive: 110 },
  { maaned: "Maj", aktive: 128 },
  { maaned: "Jun", aktive: 146 },
];

// Innovationstragten — antal pr. trin.
export const tragt = [
  { trin: "Idéer", antal: 214 },
  { trin: "Under vurdering", antal: 58 },
  { trin: "Godkendt", antal: 24 },
  { trin: "I projekt", antal: 11 },
  { trin: "Implementeret", antal: 5 },
];

export const samletNoegletal = {
  aktiveDeltagere: 146,
  deltagelsesgrad: 0.62, // andel af medarbejdere
  gnsTidIdeTilProjektUger: 6.4,
  implementerede: 5, // idéer der er nået hele vejen til implementering
};
