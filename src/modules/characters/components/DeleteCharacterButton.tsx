"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type DeleteCharacterButtonProps = {
  action: () => Promise<void>;
  onDeleted?: () => void;
};

export function DeleteCharacterButton({ action, onDeleted }: DeleteCharacterButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        onDeleted?.();
      } catch (err) {
        // Laisse passer la redirection interne sans afficher d'erreur
        if (
          isRedirectError(err) ||
          (err instanceof Error && err.message.includes("NEXT_REDIRECT"))
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la suppression du personnage."
        );
      }
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="rounded-lg border border-red-700/60 px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-950/20 hover:border-red-500 active:scale-95"
      >
        Supprimer le personnage
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-600/40 bg-red-950/25 p-3.5 text-xs text-red-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium">
          Suppression définitive, y compris l&apos;avatar et son grimoire.
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="rounded-lg bg-red-700 px-3 py-1.5 font-bold text-white shadow-sm transition-all hover:bg-red-600 disabled:opacity-50 active:scale-95"
          >
            {pending ? "Suppression..." : "Confirmer la suppression"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-stone-700 px-3 py-1.5 font-medium text-stone-300 transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-1 font-semibold text-red-400">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}