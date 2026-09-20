"use client";

import { useState } from "react";

type MessageActionMenuProps = { canDelete: boolean; deleteAction: (formData: FormData) => void | Promise<void>; reportAction: (formData: FormData) => void | Promise<void>; messageId: string };

export function MessageActionMenu({ canDelete, deleteAction, reportAction, messageId }: MessageActionMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-label="Actions du message" onClick={() => setOpen((value) => !value)} className="px-2 text-stone-400 hover:text-stone-900">
        •••
      </button>
      {open && (
        <div className="absolute right-0 z-10 w-40 border border-stone-200 bg-white py-1 shadow-lg">
          <form action={reportAction}>
            <input type="hidden" name="messageId" value={messageId} />
            <input type="hidden" name="reason" value="OTHER" />
            <button type="submit" className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50">
              Signaler
            </button>
          </form>
          {canDelete && (
            <form action={deleteAction}>
              <input type="hidden" name="messageId" value={messageId} />
              <button type="submit" className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">
                Supprimer
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
