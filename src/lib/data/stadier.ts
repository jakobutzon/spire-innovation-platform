import type { ProjektStadie } from "@/lib/types";

/**
 * 4 default-stadier på eksekverings-boardet. Lederen kan tilføje/omdøbe/slette.
 * Rækkefølgen betyder noget: det sidste stadie er altid "mål-linjen", hvor et
 * projekt får et udfald (succesfuld/ikke-succesfuld).
 */
export const stadier: ProjektStadie[] = [
  { id: "skal-laves", navn: "Skal laves" },
  { id: "i-gang", navn: "I gang" },
  { id: "afventer-feedback", navn: "Afventer feedback" },
  { id: "faerdig", navn: "Færdig" },
];
