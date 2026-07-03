import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Slå Tailwind-klasser sammen og løs konflikter. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Kompakt talformat, fx 12400 -> "12.400". */
export function tal(value: number): string {
  return new Intl.NumberFormat("da-DK").format(value);
}

/** Relativ dansk dato, fx "3 dage siden" / "om 5 dage". */
export function relativDato(iso: string): string {
  const nu = Date.now();
  const da = new Date(iso).getTime();
  const diffMs = da - nu;
  const dage = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat("da-DK", { numeric: "auto" });
  if (Math.abs(dage) < 1) {
    const timer = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(timer) < 1) return "for nylig";
    return rtf.format(timer, "hour");
  }
  if (Math.abs(dage) < 30) return rtf.format(dage, "day");
  return rtf.format(Math.round(dage / 30), "month");
}

/** Pæn dansk dato, fx "14. mar. 2026". */
export function datoKort(iso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Initialer fra et navn, fx "Mette Holm" -> "MH". */
export function initialer(navn: string): string {
  return navn
    .split(" ")
    .map((d) => d[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
