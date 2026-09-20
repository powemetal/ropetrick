import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { SessionFeedbackModal } from "@/modules/sessions/components/SessionFeedbackModal";
import {
  getSessionDetail,
  initSessionLogFromScheduledGame,
  submitSessionFeedback,
  toggleCancelScheduledGame,
  addGuestAttendance,
  removeGuestAttendance,
  upsertSessionAttendance,
} from "@/modules/sessions/server/session-service";
import type { RsvpStatus } from "@/modules/campaigns/components/SessionTomeView";
import { prisma } from "@/lib/prisma";

type SessionDetailPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

const value = (formData: FormData, key: string) => {
  const item = formData.get(key);
  return typeof item === "string" ? item : "";
};

const ATTENDANCE_BADGE_STYLE: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  ATTENDING: {
    label: "Présent",
    bg: "rgba(22, 163, 74, 0.15)",
    text: "#16a34a",
    border: "rgba(22, 163, 74, 0.4)",
    icon: "⚔️",
  },
  TENTATIVE: {
    label: "Incertain",
    bg: "rgba(234, 179, 8, 0.15)",
    text: "#ca8a04",
    border: "rgba(234, 179, 8, 0.4)",
    icon: "🎲",
  },
  NOT_ATTENDING: {
    label: "Absent",
    bg: "rgba(220, 38, 38, 0.15)",
    text: "#dc2626",
    border: "rgba(220, 38, 38, 0.4)",
    icon: "🛡️",
  },
  GUEST_PENDING: {
    label: "Invité ?",
    bg: "rgba(168, 85, 247, 0.15)",
    text: "#9333ea",
    border: "rgba(168, 85, 247, 0.4)",
    icon: "❓",
  },
};

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id, sessionId } = await params;
  const detail = await getSessionDetail(id, sessionId, userId);
  if (!detail) notFound();

  const NavigationBar = () => (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"
      style={{ borderColor: "var(--theme-accent-soft)" }}
    >
      <div className="flex items-center gap-4 text-xs font-semibold">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ color: "var(--theme-accent)" }}
        >
          <span>←</span> Calendrier / Dashboard
        </Link>
        <span style={{ color: "var(--theme-muted)" }}>·</span>
        <Link
          href={`/campaigns/${id}`}
          className="transition-opacity hover:opacity-80"
          style={{ color: "var(--theme-muted)" }}
        >
          Retour à la campagne
        </Link>
      </div>
      <Link
        href={`/campaigns/${id}/sessions`}
        className="text-xs transition-opacity hover:opacity-80"
        style={{ color: "var(--theme-muted)" }}
      >
        Toutes les sessions
      </Link>
    </nav>
  );

  const BooksHub = ({ isScheduled }: { isScheduled: boolean }) => (
    <section className="grid gap-4 sm:grid-cols-2">
      <Link
        href={`/campaigns/${id}/sessions/${sessionId}/notes`}
        className="group relative flex flex-col justify-between rounded-xl border p-5 transition-all hover:scale-[1.01]"
        style={{
          borderColor: "var(--theme-accent-soft)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--theme-accent)" }}
            >
              Livre personnel & partagé
            </span>
            <span className="text-lg">📖</span>
          </div>
          <h3 className="mt-2 text-lg font-bold" style={{ color: "var(--theme-ink)" }}>
            Notes de session
          </h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Rédigez vos notes personnelles au fil de l'aventure. Choisissez les pages privées ou partagées avec la table.
          </p>
        </div>
        <div
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "var(--theme-accent)" }}
        >
          <span>Ouvrir mes notes</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>

      <Link
        href={`/campaigns/${id}/sessions/${sessionId}/summary`}
        className="group relative flex flex-col justify-between rounded-xl border p-5 transition-all hover:scale-[1.01]"
        style={{
          borderColor: "var(--theme-accent-soft)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--theme-accent)" }}
            >
              Chronique générée
            </span>
            <span className="text-lg">📜</span>
          </div>
          <h3 className="mt-2 text-lg font-bold" style={{ color: "var(--theme-ink)" }}>
            Compte-rendu de session
          </h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {isScheduled
              ? "Sera compilé automatiquement à partir de vos notes personnelles et des notes publiques de la table."
              : "Consultez la synthèse narrative personnalisée générée à partir de vos aventures et des notes du groupe."}
          </p>
        </div>
        <div
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "var(--theme-accent)" }}
        >
          <span>{isScheduled ? "Voir l'espace de synthèse" : "Lire le compte-rendu"}</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>
    </section>
  );

  // ====================================================
  // CAS 1 : SESSION PLANIFIÉE (SCHEDULED)
  // ====================================================
  if (detail.kind === "scheduled") {
    const { game, isDm } = detail;

    // Récupération des personnages actifs pour associer joueur -> personnage
    const campaignCharacters = await prisma.campaignCharacter.findMany({
      where: { campaignId: id, isActive: true },
      include: { character: { select: { id: true, name: true } } },
    });

    const characterByUserId = new Map(
      campaignCharacters.map((c) => [c.playerId, c.character.name])
    );

    // Récupération du Maître du Jeu pour l'afficher toujours présent
    const dmMember = await prisma.campaignMember.findFirst({
      where: {
        campaignId: id,
        role: { in: ["DM", "CO_DM"] },
      },
      include: {
        user: { select: { id: true, name: true, nickname: true } },
      },
    });

    const isCancelled = (game as any).status === "CANCELLED";
    const guestList: Array<{ id: string; name: string; status: string }> = (game as any).guests
      ? JSON.parse((game as any).guests)
      : [];

    const myAttendance = game.attendances.find((a) => a.userId === userId);

    async function toggleCancelAction() {
      "use server";
      const { userId: currentUserId } = await auth();
      if (!currentUserId) redirect("/sign-in");

      await toggleCancelScheduledGame(sessionId, currentUserId, !isCancelled);
      revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
    }

    async function addGuestAction(formData: FormData) {
      "use server";
      const { userId: currentUserId } = await auth();
      if (!currentUserId) redirect("/sign-in");

      const guestName = value(formData, "guestName");
      await addGuestAttendance(sessionId, currentUserId, guestName);
      revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
    }

    async function removeGuestAction(formData: FormData) {
      "use server";
      const { userId: currentUserId } = await auth();
      if (!currentUserId) redirect("/sign-in");

      const guestId = value(formData, "guestId");
      await removeGuestAttendance(sessionId, currentUserId, guestId);
      revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
    }

    async function handleRsvpAction(formData: FormData) {
      "use server";
      const { userId: currentUserId } = await auth();
      if (!currentUserId) redirect("/sign-in");

      const rsvp = formData.get("status") as RsvpStatus;
      if (rsvp) {
        await upsertSessionAttendance(sessionId, currentUserId, rsvp);
        revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
        revalidatePath(`/campaigns/${id}/sessions/${sessionId}/notes`);
        revalidatePath(`/campaigns/${id}/schedule`);
      }
    }

    async function initSessionLogAction(formData: FormData) {
      "use server";
      const { userId: currentUserId } = await auth();
      if (!currentUserId) redirect("/sign-in");

      await initSessionLogFromScheduledGame(id, currentUserId, sessionId, {
        title: value(formData, "title") || game.title,
        playedAt: game.dateTime,
        summary: value(formData, "summary"),
      });

      revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
    }

    return (
      <main
        className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-12"
        style={{
          color: "var(--theme-ink)",
          backgroundColor: "var(--theme-background)",
        }}
      >
        <NavigationBar />

        {/* Alerte si session annulée */}
        {isCancelled && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-500 flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold text-sm">
              <span className="text-xl">🚫</span>
              <span>Cette session a été déclarée ANNULÉE par le Maître du Jeu.</span>
            </div>
            {isDm && (
              <form action={toggleCancelAction}>
                <button
                  type="submit"
                  className="rounded-md border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-500/30"
                >
                  Rétablir la session
                </button>
              </form>
            )}
          </div>
        )}

        {/* En-tête */}
        <header
          className="rounded-2xl border p-6 backdrop-blur-sm"
          style={{
            borderColor: "var(--theme-accent-soft)",
            background: "var(--theme-surface)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--theme-accent)" }}
            >
              Session planifiée
            </p>
            <div className="flex items-center gap-2">
              {isCancelled ? (
                <span className="rounded-full bg-rose-500/20 border border-rose-500/50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-500">
                  Annulée
                </span>
              ) : (
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                  style={{
                    borderColor: "var(--theme-accent-soft)",
                    color: "var(--theme-muted)",
                  }}
                >
                  À venir
                </span>
              )}
              {isDm && !isCancelled && (
                <form action={toggleCancelAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-500/20"
                  >
                    Annuler la session
                  </button>
                </form>
              )}
            </div>
          </div>
          <h1 className="mt-2 text-3xl font-black" style={{ color: "var(--theme-ink)" }}>
            {game.title}
          </h1>
          <p className="mt-2 text-xs font-medium" style={{ color: "var(--theme-muted)" }}>
            Prévue le{" "}
            {new Date(game.dateTime).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            à{" "}
            {new Date(game.dateTime).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </header>

        <BooksHub isScheduled={true} />

        {/* Section Présences */}
        <section
          className="rounded-2xl border p-6"
          style={{
            borderColor: "var(--theme-accent-soft)",
            background: "var(--theme-surface)",
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
            style={{ borderColor: "var(--theme-accent-soft)" }}
          >
            <h2 className="text-base font-bold" style={{ color: "var(--theme-ink)" }}>
              Présences et disponibilités de la table
            </h2>

            {/* Formulaire ajout d'invité ou slot "?" réservé au MJ */}
            {isDm && (
              <form action={addGuestAction} className="flex items-center gap-2">
                <input
                  name="guestName"
                  placeholder="Invité ? ou nom..."
                  className="rounded-md border px-2.5 py-1 text-xs outline-none"
                  style={{
                    borderColor: "var(--theme-accent-soft)",
                    background: "var(--theme-background)",
                    color: "var(--theme-ink)",
                  }}
                />
                <button
                  type="submit"
                  className="rounded-md border border-purple-500/40 bg-purple-500/15 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-500/25"
                >
                  + Invité (?)
                </button>
              </form>
            )}
          </div>

          {/* Barre de réponse RSVP pour le joueur connecté */}
          {!isCancelled && !isDm && (
            <div
              className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5"
              style={{
                borderColor: "var(--theme-accent-soft)",
                backgroundColor: "var(--theme-background)",
              }}
            >
              <div className="text-xs">
                <span className="font-bold" style={{ color: "var(--theme-ink)" }}>
                  Votre réponse :
                </span>
                <span className="ml-1.5" style={{ color: "var(--theme-muted)" }}>
                  {myAttendance?.status === "ATTENDING" && "⚔️ Confirmé présent"}
                  {myAttendance?.status === "TENTATIVE" && "🎲 Noté incertain"}
                  {myAttendance?.status === "NOT_ATTENDING" && "🛡️ Noté absent"}
                  {!myAttendance && "En attente de votre réponse"}
                </span>
              </div>

              <form action={handleRsvpAction} className="flex items-center gap-2">
                {/* Présent - Vert */}
                <button
                  type="submit"
                  name="status"
                  value="ATTENDING"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor:
                      myAttendance?.status === "ATTENDING"
                        ? "rgba(22, 163, 74, 0.25)"
                        : "rgba(22, 163, 74, 0.08)",
                    color: "#16a34a",
                    borderColor:
                      myAttendance?.status === "ATTENDING"
                        ? "#16a34a"
                        : "rgba(22, 163, 74, 0.3)",
                  }}
                >
                  <span>⚔️</span>
                  <span>Présent</span>
                </button>

                {/* Incertain - Jaune */}
                <button
                  type="submit"
                  name="status"
                  value="MAYBE"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor:
                      myAttendance?.status === "TENTATIVE"
                        ? "rgba(234, 179, 8, 0.25)"
                        : "rgba(234, 179, 8, 0.08)",
                    color: "#ca8a04",
                    borderColor:
                      myAttendance?.status === "TENTATIVE"
                        ? "#ca8a04"
                        : "rgba(234, 179, 8, 0.3)",
                  }}
                >
                  <span>🎲</span>
                  <span>Incertain</span>
                </button>

                {/* Absent - Rouge */}
                <button
                  type="submit"
                  name="status"
                  value="ABSENT"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    backgroundColor:
                      myAttendance?.status === "NOT_ATTENDING"
                        ? "rgba(220, 38, 38, 0.25)"
                        : "rgba(220, 38, 38, 0.08)",
                    color: "#dc2626",
                    borderColor:
                      myAttendance?.status === "NOT_ATTENDING"
                        ? "#dc2626"
                        : "rgba(220, 38, 38, 0.3)",
                  }}
                >
                  <span>🛡️</span>
                  <span>Absent</span>
                </button>
              </form>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {/* 1. Carte Toujours Présente du Maître du Jeu */}
            {dmMember && (
              <div
                className="flex items-center justify-between rounded-lg border p-3 text-xs shadow-xs"
                style={{
                  borderColor: "rgba(234, 179, 8, 0.4)",
                  backgroundColor: "rgba(234, 179, 8, 0.05)",
                }}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    👑 Maître du Jeu
                  </span>
                  <span className="text-[10px] opacity-75">
                    {dmMember.user.nickname ?? dmMember.user.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                  <span>⚔️</span>
                  <span>Présent</span>
                </span>
              </div>
            )}

            {/* 2. Joueurs avec nom de personnage prioritaire */}
            {game.attendances.map((attendance) => {
              const charName = characterByUserId.get(attendance.userId) ?? "Aventurier";
              const userName = attendance.user.nickname ?? attendance.user.name;
              const badge = ATTENDANCE_BADGE_STYLE[attendance.status] ?? {
                label: attendance.status,
                bg: "var(--theme-accent-soft)",
                text: "var(--theme-accent)",
                border: "transparent",
                icon: "⏳",
              };

              return (
                <div
                  key={attendance.userId}
                  className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  style={{
                    borderColor: "var(--theme-accent-soft)",
                    backgroundColor: "var(--theme-background)",
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm" style={{ color: "var(--theme-ink)" }}>
                      {charName}
                    </span>
                    <span className="text-[10px] opacity-70" style={{ color: "var(--theme-muted)" }}>
                      Joueur : {userName}
                    </span>
                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      borderColor: badge.border,
                    }}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                </div>
              );
            })}

            {/* 3. Invités et slots '?' avec bouton de suppression pour le MJ */}
            {guestList.map((guest) => {
              const badge = ATTENDANCE_BADGE_STYLE.GUEST_PENDING;
              return (
                <div
                  key={guest.id}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3 text-xs"
                  style={{
                    borderColor: "rgba(168, 85, 247, 0.4)",
                    backgroundColor: "rgba(168, 85, 247, 0.05)",
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {guest.name}
                    </span>
                    <span className="text-[10px] opacity-70">Place d'invité</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.text,
                        borderColor: badge.border,
                      }}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    {isDm && (
                      <form action={removeGuestAction}>
                        <input type="hidden" name="guestId" value={guest.id} />
                        <button
                          type="submit"
                          title="Retirer cet invité"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-stone-400 hover:bg-rose-500/20 hover:text-rose-600 transition-colors"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section Clôture / Log MJ */}
        {isDm && (
          <section
            className="rounded-2xl border p-6"
            style={{
              borderColor: "var(--theme-accent-soft)",
              background: "var(--theme-surface)",
            }}
          >
            <h2 className="text-base font-bold" style={{ color: "var(--theme-ink)" }}>
              Zone Maître du Jeu : Clôturer la session
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--theme-muted)" }}>
              Vous pouvez initialiser dès maintenant l'enregistrement officiel de la session pour la basculer dans le journal de campagne.
            </p>
            <form action={initSessionLogAction} className="mt-4 space-y-3">
              <input
                name="title"
                defaultValue={game.title}
                placeholder="Titre du compte-rendu"
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                style={{
                  borderColor: "var(--theme-accent-soft)",
                  background: "var(--theme-background)",
                  color: "var(--theme-ink)",
                }}
              />
              <textarea
                name="summary"
                rows={4}
                placeholder="Notes préliminaires du MJ pour la session..."
                className="w-full rounded-lg border px-3 py-2 text-xs outline-none"
                style={{
                  borderColor: "var(--theme-accent-soft)",
                  background: "var(--theme-background)",
                  color: "var(--theme-ink)",
                }}
              />
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90"
                style={{
                  background: "var(--theme-accent)",
                  color: "var(--theme-background)",
                }}
              >
                Archiver et valider la session jouée
              </button>
            </form>
          </section>
        )}
      </main>
    );
  }

  // ====================================================
  // CAS 2 : SESSION JOUÉE (LOG EXISTANT)
  // ====================================================
  const { session } = detail;

  async function feedbackAction(formData: FormData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    await submitSessionFeedback(
      session.id,
      currentUserId,
      Number(value(formData, "rating")) || null,
      value(formData, "comment"),
      value(formData, "isPrivate") !== "on"
    );

    revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
  }

  return (
    <main
      className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-12"
      style={{
        color: "var(--theme-ink)",
        backgroundColor: "var(--theme-background)",
      }}
    >
      <NavigationBar />

      <header
        className="rounded-2xl border p-6 backdrop-blur-sm"
        style={{
          borderColor: "var(--theme-accent-soft)",
          background: "var(--theme-surface)",
        }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--theme-accent)" }}
          >
            Session {session.sessionNumber}
          </p>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              borderColor: "var(--theme-accent-soft)",
              color: "var(--theme-accent)",
            }}
          >
            Jouée
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-black" style={{ color: "var(--theme-ink)" }}>
          {session.title}
        </h1>
        <p className="mt-2 text-xs font-medium" style={{ color: "var(--theme-muted)" }}>
          Partie tenue le{" "}
          {new Date(session.playedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <BooksHub isScheduled={false} />

      <section
        className="rounded-2xl border p-6"
        style={{
          borderColor: "var(--theme-accent-soft)",
          background: "var(--theme-surface)",
        }}
      >
        <h2 className="text-base font-bold" style={{ color: "var(--theme-ink)" }}>
          Aperçu narratif
        </h2>
        <p
          className="mt-3 whitespace-pre-wrap text-xs leading-relaxed"
          style={{ color: "var(--theme-ink)" }}
        >
          {session.summary || "Aucun résumé narratif saisi."}
        </p>
        {session.dmNotes && (
          <div
            className="mt-4 rounded-lg border-l-2 p-3 text-xs"
            style={{
              borderColor: "var(--theme-accent)",
              background: "var(--theme-background)",
            }}
          >
            <p
              className="font-bold uppercase tracking-wider text-[10px]"
              style={{ color: "var(--theme-accent)" }}
            >
              Notes du Maître du Jeu
            </p>
            <p className="mt-1 whitespace-pre-wrap" style={{ color: "var(--theme-muted)" }}>
              {session.dmNotes}
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--theme-accent-soft)",
            background: "var(--theme-surface)",
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--theme-accent)" }}
          >
            Participants
          </h3>
          <ul className="mt-3 space-y-1.5 text-xs" style={{ color: "var(--theme-ink)" }}>
            {session.attendees.map((attendee) => (
              <li key={attendee.user.id}>
                <span className="font-semibold">
                  {attendee.character?.name ?? "Aventurier"}
                </span>
                <span style={{ color: "var(--theme-muted)" }}> ({attendee.user.name})</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--theme-accent-soft)",
            background: "var(--theme-surface)",
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--theme-accent)" }}
          >
            Lieux explorés
          </h3>
          <ul className="mt-3 space-y-1 text-xs" style={{ color: "var(--theme-ink)" }}>
            {session.visitedLocations.length === 0 ? (
              <li className="italic text-[11px]" style={{ color: "var(--theme-muted)" }}>
                Aucun lieu consigné
              </li>
            ) : (
              session.visitedLocations.map((entry) => (
                <li key={entry.location.id}>{entry.location.name}</li>
              ))
            )}
          </ul>
        </div>

        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--theme-accent-soft)",
            background: "var(--theme-surface)",
          }}
        >
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--theme-accent)" }}
          >
            PNJ rencontrés
          </h3>
          <ul className="mt-3 space-y-1 text-xs" style={{ color: "var(--theme-ink)" }}>
            {session.metNpcs.length === 0 ? (
              <li className="italic text-[11px]" style={{ color: "var(--theme-muted)" }}>
                Aucun PNJ consigné
              </li>
            ) : (
              session.metNpcs.map((entry) => (
                <li key={entry.npc.id}>{entry.npc.name}</li>
              ))
            )}
          </ul>
        </div>
      </div>

      <section
        className="rounded-2xl border p-6"
        style={{
          borderColor: "var(--theme-accent-soft)",
          background: "var(--theme-surface)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--theme-ink)" }}>
              Impressions et retours
            </h2>
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              Partagez vos impressions sur la séance avec le groupe ou en privé au MJ.
            </p>
          </div>
          <SessionFeedbackModal action={feedbackAction} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {session.feedback.length === 0 ? (
            <p className="col-span-2 text-xs italic" style={{ color: "var(--theme-muted)" }}>
              Aucun retour pour le moment.
            </p>
          ) : (
            session.feedback.map((feedback) => (
              <article
                key={feedback.id}
                className="rounded-lg border p-3 text-xs"
                style={{
                  borderColor: "var(--theme-accent-soft)",
                  backgroundColor: "var(--theme-background)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: "var(--theme-ink)" }}>
                    {feedback.user.name}
                  </span>
                  <span style={{ color: "var(--theme-accent)" }}>
                    {feedback.rating ? `${feedback.rating} / 5 ★` : "Note non attribuée"}
                  </span>
                </div>
                <p className="mt-2" style={{ color: "var(--theme-muted)" }}>
                  {feedback.comment}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}