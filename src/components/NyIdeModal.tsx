"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { ANDET_ID } from "@/lib/data/kategorier";

export function NyIdeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { tilfoejIde, kategorier } = useStore();
  const router = useRouter();
  const [titel, setTitel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [kategoriId, setKategoriId] = useState(ANDET_ID);

  function reset() {
    setTitel("");
    setBeskrivelse("");
    setKategoriId(ANDET_ID);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!titel.trim() || !beskrivelse.trim() || !kategoriId) return;
    const id = tilfoejIde({
      titel: titel.trim(),
      beskrivelse: beskrivelse.trim(),
      kategoriId,
    });
    reset();
    onClose();
    router.push(`/ideer/${id}`);
  }

  const felt =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <Modal open={open} onClose={onClose} titel="Indsend en ny idé">
      <form onSubmit={send} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Titel</label>
          <input
            className={felt}
            placeholder="Giv din idé en fængende titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Beskrivelse</label>
          <textarea
            className={`${felt} min-h-28 resize-y`}
            placeholder="Hvilket problem løser idéen, og hvad er gevinsten?"
            value={beskrivelse}
            onChange={(e) => setBeskrivelse(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kategori</label>
          <select
            className={felt}
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
          >
            {kategorier.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Vælg det emne din idé bedst hører under. Passer den ikke ind, så vælg
            &quot;Andet&quot;.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annullér
          </Button>
          <Button
            type="submit"
            disabled={!titel.trim() || !beskrivelse.trim() || !kategoriId}
          >
            Indsend idé
          </Button>
        </div>
      </form>
    </Modal>
  );
}
