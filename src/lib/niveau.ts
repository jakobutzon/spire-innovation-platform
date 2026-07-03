/** Antal fuldførte opgaver, der skal til for at stige ét niveau. */
export const OPGAVER_PR_NIVEAU = 5;

/** Regn niveau ud fra samlet erfaring (fuldførte opgaver). Alle starter på niveau 1. */
export function niveauAf(erfaring: number): number {
  return Math.floor(Math.max(0, erfaring) / OPGAVER_PR_NIVEAU) + 1;
}

/** Hvor mange opgaver man er nået ind i det nuværende niveau (0-4). */
export function fremgangINiveau(erfaring: number): number {
  return Math.max(0, erfaring) % OPGAVER_PR_NIVEAU;
}
