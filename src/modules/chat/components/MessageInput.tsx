/* eslint-disable @next/next/no-img-element */
"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

type MessageInputProps = { action: (previousState: { ok: boolean; message: string }, formData: FormData) => Promise<{ ok: boolean; message: string }> };

export function MessageInput({ action }: MessageInputProps) {
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message);
  }, [state]);
  return (
    <form action={formAction} className="border-t border-stone-200 bg-white p-4">
      <div className="flex gap-2">
        <input required name="content" placeholder="Écrire un message..." className="min-w-0 flex-1 border border-stone-300 px-3 py-2 text-sm" />
        <button disabled={pending} type="submit" className="bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50">
          {pending ? "..." : "Envoyer"}
        </button>
      </div>
      <label className="mt-3 block text-xs text-stone-500">
        URL d’image ou pièce jointe
        <input name="attachmentUrl" value={attachmentUrl} onChange={(event) => setAttachmentUrl(event.target.value)} placeholder="https://..." className="mt-1 block w-full border border-stone-200 px-3 py-2 text-sm" />
      </label>
      {attachmentUrl && (
        <div className="mt-3 border border-stone-200 bg-stone-50 p-2">
          <p className="mb-2 text-xs text-stone-500">Prévisualisation</p>
          {attachmentUrl.match(/^https?:\/\//) ? <img src={attachmentUrl} alt="Aperçu de la pièce jointe" className="max-h-32 max-w-full object-contain" /> : <p className="text-sm text-red-700">URL invalide</p>}
        </div>
      )}
    </form>
  );
}
