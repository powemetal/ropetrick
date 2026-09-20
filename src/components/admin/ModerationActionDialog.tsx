"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

export type AdminActionState = { ok: boolean; message: string };
type ModerationActionDialogProps = { reportId: string; action: "DISMISS" | "DELETE_CONTENT" | "SUSPEND_USER"; label: string; actionHandler: (previousState: AdminActionState, formData: FormData) => Promise<AdminActionState> };

const initialState: AdminActionState = { ok: false, message: "" };

export function ModerationActionDialog({ reportId, action, label, actionHandler }: ModerationActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(actionHandler, initialState);

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message);
  }, [state]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/50 p-6" role="dialog" aria-modal="true" aria-labelledby={`moderation-${reportId}-${action}`}>
          <form action={formAction} className="w-full max-w-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id={`moderation-${reportId}-${action}`} className="text-lg font-semibold text-stone-900">
                {label}
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="text-xl text-stone-500">
                ×
              </button>
            </div>
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="action" value={action} />
            <label className="mt-5 grid gap-1 text-sm text-stone-700">
              Motif obligatoire
              <textarea required name="reason" minLength={3} rows={4} className="border border-stone-300 px-3 py-2" />
            </label>
            {state.message && <p className={`mt-3 text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
            <div className="mt-5 flex gap-2">
              <button type="button" disabled={pending} onClick={() => setOpen(false)} className="border border-stone-300 px-4 py-2 text-sm text-stone-700">
                Annuler
              </button>
              <button type="submit" disabled={pending} className="bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                {pending ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
