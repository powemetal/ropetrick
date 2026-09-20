"use client";

import { useState } from "react";

type SessionFeedbackModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function SessionFeedbackModal({ action }: SessionFeedbackModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
        Donner mon retour
      </button>
      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-stone-950/40 p-6" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
          <form action={action} className="w-full max-w-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="feedback-title" className="text-xl font-semibold text-stone-900">
                Retour de session
              </h2>
              <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="text-xl text-stone-500">
                ×
              </button>
            </div>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-stone-700">Note</legend>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating} className="cursor-pointer text-2xl text-amber-600">
                    <input required type="radio" name="rating" value={rating} className="sr-only" />★
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-5 grid gap-1 text-sm text-stone-700">
              Commentaire
              <textarea name="comment" rows={4} className="border border-stone-300 px-3 py-2" />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="isPrivate" /> Message privé au MJ
            </label>
            <button type="submit" className="mt-5 bg-stone-900 px-4 py-2 text-sm font-medium text-white">
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  );
}
