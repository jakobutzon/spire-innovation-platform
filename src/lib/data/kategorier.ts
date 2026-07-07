import type { Kategori } from "@/lib/types";

/** Fast fallback-kategori — kan ikke slettes. */
export const ANDET_ID = "k-andet";

/**
 * 6 default-kategorier. Lederen kan tilføje/omdøbe/slette (undtagen "Andet").
 * Bevidst uden rødt/grønt — de farver er reserveret til succesfuld/ikke-succesfuld
 * på projekter, så en kategori-chip aldrig kan forveksles med et udfald.
 */
export const kategorier: Kategori[] = [
  { id: "k-baeredygtig", navn: "Bæredygtighed", chipFarve: "bg-cyan-100 text-cyan-700" },
  { id: "k-effektivisering", navn: "Effektivisering af virksomheden", chipFarve: "bg-brand-100 text-brand-700" },
  { id: "k-produkter", navn: "Nye produkter/features", chipFarve: "bg-amber-100 text-amber-700" },
  { id: "k-kundeoplevelse", navn: "Kundeoplevelse", chipFarve: "bg-fuchsia-100 text-fuchsia-700" },
  { id: "k-teknologi", navn: "Teknologi", chipFarve: "bg-violet-100 text-violet-700" },
  { id: ANDET_ID, navn: "Andet", chipFarve: "bg-slate-100 text-slate-600" },
];

/** Farvepalet til automatisk styling af nye kategorier, lederen tilføjer. */
export const KATEGORI_PALETTE: string[] = [
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
];

/**
 * Alle farver lederen kan vælge mellem til en kategori. Bevidst kun 8 og
 * spredt ud over farvehjulet, så de er tydeligt forskellige fra hinanden
 * (ikke flere næsten-ens blå/lilla-toner som tidligere). Rødt og grønt er
 * udeladt — de er reserveret til succesfuld/ikke-succesfuld-signalet på
 * projekter.
 */
export const KATEGORI_FARVER: string[] = [
  "bg-blue-100 text-blue-700",
  "bg-brand-100 text-brand-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-amber-100 text-amber-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
  "bg-slate-100 text-slate-600",
];
