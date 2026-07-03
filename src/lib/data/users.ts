import type { Badge, User } from "@/lib/types";

export const badges: Record<string, Badge> = {
  idemager: {
    id: "idemager",
    navn: "Idémager",
    ikon: "Lightbulb",
    beskrivelse: "Har indsendt 10+ idéer.",
  },
  hjaelpsom: {
    id: "hjaelpsom",
    navn: "Sparringspartner",
    ikon: "MessagesSquare",
    beskrivelse: "Har givet feedback på 25+ idéer.",
  },
  vindere: {
    id: "vindere",
    navn: "Vinderidé",
    ikon: "Trophy",
    beskrivelse: "Havde en idé, der blev til et projekt.",
  },
};

export const users: User[] = [
  {
    id: "u-mette",
    navn: "Mette Holm",
    rolle: "medarbejder",
    titel: "Produktdesigner",
    afdeling: "Produkt",
    avatarFarve: "bg-rose-500",
    erfaring: 19,
    badges: [badges.idemager, badges.vindere],
  },
  {
    id: "u-anders",
    navn: "Anders Bjerg",
    rolle: "leder",
    titel: "Innovationschef",
    afdeling: "Strategi & Innovation",
    avatarFarve: "bg-brand-600",
    erfaring: 27,
    badges: [badges.vindere, badges.hjaelpsom],
  },
  {
    id: "u-sara",
    navn: "Sara Lindqvist",
    rolle: "admin",
    titel: "Platformadministrator",
    afdeling: "IT & Digitalisering",
    avatarFarve: "bg-accent-600",
    erfaring: 4,
    badges: [],
  },
  {
    id: "u-jonas",
    navn: "Jonas Kring",
    rolle: "medarbejder",
    titel: "Kundeservicekonsulent",
    afdeling: "Kundeservice",
    avatarFarve: "bg-emerald-500",
    erfaring: 14,
    badges: [badges.hjaelpsom],
  },
  {
    id: "u-laila",
    navn: "Laila Mortensen",
    rolle: "medarbejder",
    titel: "Data scientist",
    afdeling: "Data & Analytics",
    avatarFarve: "bg-amber-500",
    erfaring: 23,
    badges: [badges.idemager, badges.vindere],
  },
  {
    id: "u-omar",
    navn: "Omar Haddad",
    rolle: "medarbejder",
    titel: "Logistikplanlægger",
    afdeling: "Supply Chain",
    avatarFarve: "bg-sky-500",
    erfaring: 11,
    badges: [],
  },
  {
    id: "u-trine",
    navn: "Trine Falk",
    rolle: "leder",
    titel: "Marketingdirektør",
    afdeling: "Marketing",
    avatarFarve: "bg-fuchsia-500",
    erfaring: 9,
    badges: [badges.hjaelpsom],
  },
  {
    id: "u-peter",
    navn: "Peter Storm",
    rolle: "medarbejder",
    titel: "Softwareudvikler",
    afdeling: "Engineering",
    avatarFarve: "bg-indigo-500",
    erfaring: 16,
    badges: [badges.idemager],
  },
];

/** Demo-bruger pr. rolle, der bruges af rolleskifteren. */
export const demoBrugerePerRolle: Record<string, string> = {
  medarbejder: "u-mette",
  leder: "u-anders",
  admin: "u-sara",
};

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
