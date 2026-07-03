import type { Idea } from "@/lib/types";

export { users, badges, getUser, demoBrugerePerRolle } from "./users";
export { ideas } from "./ideas";
export { projects, getProject, getProjectByIde } from "./teams";
export {
  ideerPrMaaned,
  deltagelsePrMaaned,
  tragt,
  samletNoegletal,
} from "./portfolio";

// ---- Selektorer (rene funktioner over de data, der gives ind) ----

export function getIdea(ideas: Idea[], id: string): Idea | undefined {
  return ideas.find((i) => i.id === id);
}

/** En idé er "åben", indtil lederen sender den til projekt eller afviser den. */
export function erAaben(idea: Idea): boolean {
  return idea.status !== "i-projekt" && idea.status !== "afvist";
}

export const STATUS_LABELS: Record<Idea["status"], string> = {
  ny: "Ny",
  "under-vurdering": "Under vurdering",
  godkendt: "Godkendt",
  afvist: "Afvist",
  "i-projekt": "I projekt",
};
