"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { AdminActionState } from "@/components/admin/ModerationActionDialog";

type UserStatusFormProps = { userId: string; currentStatus: string; currentAdminId: string; actionHandler: (previousState: AdminActionState, formData: FormData) => Promise<AdminActionState> };
const initialState: AdminActionState = { ok: false, message: "" };

export function UserStatusForm({ userId, currentStatus, currentAdminId, actionHandler }: UserStatusFormProps) {
  const [state, formAction, pending] = useActionState(actionHandler, initialState);
  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message);
  }, [state]);
  const isOwnAccount = userId === currentAdminId;
  return (
    <form action={formAction} className="flex min-w-72 flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="grid gap-1 text-xs text-stone-500">
        Statut
        <select name="status" defaultValue={currentStatus} disabled={isOwnAccount || pending} className="border border-stone-300 px-2 py-1.5 text-sm text-stone-800">
          <option value="ACTIVE">Actif</option>
          <option value="SUSPENDED">Suspendu</option>
          <option value="BANNED">Banni</option>
        </select>
      </label>
      <label className="grid min-w-44 gap-1 text-xs text-stone-500">
        Motif
        <input required name="reason" minLength={3} disabled={isOwnAccount || pending} placeholder="Motif" className="border border-stone-300 px-2 py-1.5 text-sm text-stone-800" />
      </label>
      <button type="submit" disabled={isOwnAccount || pending} className="bg-stone-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
        {isOwnAccount ? "Votre compte" : pending ? "..." : "Mettre à jour"}
      </button>
      {isOwnAccount && <p className="basis-full text-xs text-stone-500">Votre propre statut est protégé.</p>}
      {state.message && <p className={`basis-full text-xs ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
    </form>
  );
}
