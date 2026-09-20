"use client";

import { useState } from "react";

type JoinCampaignModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function JoinCampaignModal({ action }: JoinCampaignModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900 hover:text-stone-900">
        Rejoindre une campagne
      </button>
      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-stone-950/40 p-6" role="dialog" aria-modal="true" aria-labelledby="join-campaign-title">
          <form action={action} className="w-full max-w-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="join-campaign-title" className="text-xl font-semibold text-stone-900">
                Rejoindre une campagne
              </h2>
              <button type="button" aria-label="Fermer" onClick={() => setOpen(false)} className="text-xl text-stone-500 hover:text-stone-900">
                ×
              </button>
            </div>
            <label className="mt-6 grid gap-1 text-sm text-stone-700">
              Code d’invitation
              <input required name="inviteCode" autoFocus className="border border-stone-300 px-3 py-2 uppercase tracking-widest" />
            </label>
            <button type="submit" className="mt-5 bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
              Rejoindre
            </button>
          </form>
        </div>
      )}
    </>
  );
}
