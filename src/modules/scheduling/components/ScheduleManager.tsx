"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type ScheduleGame = {
  id: string;
  dateTime: Date | string;
  title: string;
  status?: string;
  attendances: Array<{
    userId: string;
    status: string;
    comment: string | null;
    user: { name: string; nickname: string };
  }>;
};

type ScheduleManagerProps = {
  games: ScheduleGame[];
  currentUserId: string;
  attendanceAction: (
    previousState: { ok: boolean; message: string },
    formData: FormData
  ) => Promise<{ ok: boolean; message: string }>;
};

const statuses = [
  { value: "ATTENDING", label: "Présent", icon: "⚔️" },
  { value: "TENTATIVE", label: "Incertain", icon: "🎲" },
  { value: "NOT_ATTENDING", label: "Absent", icon: "🛡️" },
];

export function ScheduleManager({ games, currentUserId, attendanceAction }: ScheduleManagerProps) {
  const params = useParams();
  const campaignId = (params?.id as string) ?? "";
  const [comments, setComments] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState(attendanceAction, { ok: false, message: "" });

  useEffect(() => {
    if (state.message) toast[state.ok ? "success" : "error"](state.message);
  }, [state]);

  return (
    <section className="space-y-4">
      {games.length === 0 ? (
        <p className="border border-stone-200 bg-white p-6 text-stone-600">Aucune partie à venir.</p>
      ) : (
        games.map((game) => {
          const isCancelled = game.status === "CANCELLED";
          const ownAttendance = game.attendances.find((attendance) => attendance.userId === currentUserId);

          return (
            <article
              key={game.id}
              className={`relative border p-5 transition-all shadow-xs ${
                isCancelled
                  ? "border-red-500/80 bg-red-50/50 dark:border-red-900/80 dark:bg-red-950/20"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3.5">
                  {/* GROS X ROUGE BIEN VISIBLE */}
                  {isCancelled ? (
                    <div
                      title="Session annulée"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-black text-white shadow-md ring-4 ring-red-200 dark:ring-red-900/40"
                    >
                      <span className="text-xl leading-none">✕</span>
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                      <span className="text-lg">📅</span>
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`text-lg font-bold ${
                          isCancelled
                            ? "text-red-700 line-through dark:text-red-400"
                            : "text-stone-900 dark:text-stone-100"
                        }`}
                      >
                        {game.title}
                      </h2>

                      {/* Badge Annulée */}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                          <span>✕</span>
                          <span>Annulée</span>
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        isCancelled ? "text-red-600/80 line-through" : "text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {new Date(game.dateTime).toLocaleString("fr-FR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>

                    {campaignId && (
                      <Link
                        href={`/campaigns/${campaignId}/sessions/${game.id}`}
                        className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline"
                      >
                        Détails de la session →
                      </Link>
                    )}
                  </div>
                </div>

                <span className="text-xs font-medium text-stone-500">
                  {game.attendances.length} réponse(s)
                </span>
              </div>

              {/* Si annulée : alerte rouge et désactivation des votes */}
              {isCancelled ? (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-100/70 px-3 py-2 text-xs font-bold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  <span className="text-sm font-black text-red-600">✕</span>
                  <span>Cette session est annulée par le Maître du Jeu. Inscriptions suspendues.</span>
                </div>
              ) : (
                /* Formulaire de vote habituel */
                <form action={formAction} className="mt-5 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="gameId" value={game.id} />
                  <label className="grid w-full gap-1 text-xs text-stone-500 sm:w-auto sm:min-w-64">
                    Commentaire
                    <input
                      name="comment"
                      value={comments[game.id] ?? ownAttendance?.comment ?? ""}
                      onChange={(event) =>
                        setComments((current) => ({ ...current, [game.id]: event.target.value }))
                      }
                      className="border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                      placeholder="Commentaire ou précision..."
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {statuses.map((status) => {
                      const isSelected = ownAttendance?.status === status.value;
                      return (
                        <button
                          key={status.value}
                          disabled={pending}
                          type="submit"
                          name="status"
                          value={status.value}
                          className={`flex items-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
                            isSelected
                              ? "border-amber-700 bg-amber-700 text-white shadow-xs"
                              : "border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          <span>{status.icon}</span>
                          <span>{pending && isSelected ? "..." : status.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </form>
              )}
            </article>
          );
        })
      )}
    </section>
  );
}