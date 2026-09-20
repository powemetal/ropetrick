"use client";

import { useState, useTransition } from "react";

export function DeleteCharacterButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirming)
    return (
      <button type="button" onClick={() => setConfirming(true)} className="rounded border border-red-700 px-3 py-2 text-sm text-red-700">
        Supprimer le personnage
      </button>
    );
  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
      <span>Suppression définitive, y compris l&apos;avatar.</span>
      <button type="button" disabled={pending} onClick={() => startTransition(action)} className="rounded bg-red-700 px-3 py-2 font-semibold text-white">
        {pending ? "Suppression..." : "Confirmer"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="rounded border border-red-300 px-3 py-2">
        Annuler
      </button>
    </div>
  );
}
