import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCampaignMemberRole, getCampaignDetails } from "@/modules/campaigns/server/campaign-service";
import {
  getSessionDetail,
  getPlayerSessionNotes,
  upsertPlayerSessionNote,
  getPlayerGrimoireTheme,
  updatePlayerGrimoireTheme,
  upsertSessionAttendance,
} from "@/modules/sessions/server/session-service";
import {
  SessionTomeView,
  type SessionNote,
  type NotebookTheme,
  type RsvpStatus,
  type SessionAttendance,
} from "@/modules/campaigns/components/SessionTomeView";
import { DND_THEMES, type DndThemeKey, themeStyle } from "@/styles/dnd-themes";

type SessionNotesPageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

function getCampaignTheme(campaignId: string): DndThemeKey {
  const themeKeys = Object.keys(DND_THEMES) as DndThemeKey[];
  let hash = 0;
  for (let i = 0; i < campaignId.length; i++) {
    hash = campaignId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % themeKeys.length;
  return themeKeys[index] ?? "dark";
}

function mapPrismaStatusToRsvp(status: string): RsvpStatus {
  switch (status) {
    case "ATTENDING":
      return "ATTENDING";
    case "NOT_ATTENDING":
      return "ABSENT";
    case "TENTATIVE":
      return "MAYBE";
    default:
      return "PENDING";
  }
}

export default async function SessionNotesPage({ params }: SessionNotesPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id, sessionId } = await params;

  const [role, campaign, detail, rawNotes, initialGrimoireTheme] = await Promise.all([
    getCampaignMemberRole(id, userId),
    getCampaignDetails(id, userId),
    getSessionDetail(id, sessionId, userId),
    getPlayerSessionNotes(sessionId, userId),
    getPlayerGrimoireTheme(id, userId),
  ]);

  if (!role || !detail) notFound();

  const activeThemeKey = getCampaignTheme(id);
  const theme = DND_THEMES[activeThemeKey];
  const themeStyles = themeStyle(activeThemeKey);

  const sessionData =
    detail.kind === "scheduled"
      ? {
          id: detail.game.id,
          title: detail.game.title,
          description: campaign.description ?? "",
          dateTime: new Date(detail.game.dateTime).toISOString(),
          location: "Table de jeu",
        }
      : {
          id: detail.session.id,
          title: detail.session.title,
          description: detail.session.summary ?? "",
          dateTime: new Date(detail.session.playedAt).toISOString(),
          location: "Table de jeu",
        };

  // 1. Formatage des présences
  const rawAttendances = detail.kind === "scheduled" ? detail.game.attendances : [];
  const attendancesData: SessionAttendance[] = rawAttendances.map((a) => ({
    id: `${a.userId}-${sessionId}`,
    userId: a.userId,
    userName: a.user.nickname || a.user.name,
    status: mapPrismaStatusToRsvp(a.status),
  }));

  // 2. Statut actuel de l'utilisateur connecté
  const currentUserAttendance = attendancesData.find((a) => a.userId === userId)?.status ?? "PENDING";

  // 3. Formatage des notes
  const formattedNotes: SessionNote[] = rawNotes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    isShared: note.isShared,
    authorName: note.user.nickname || note.user.name,
    createdAt: note.createdAt.toISOString(),
  }));

  async function handleSaveNote(
    noteId: string | null,
    data: { title: string; content: string; isShared: boolean }
  ) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    await upsertPlayerSessionNote(sessionId, currentUserId, noteId, data);
    revalidatePath(`/campaigns/${id}/sessions/${sessionId}/notes`);
    return { ok: true, message: "Feuillet consigné dans votre grimoire !" };
  }

  async function handleSaveTheme(selectedTheme: NotebookTheme) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    const res = await updatePlayerGrimoireTheme(id, currentUserId, selectedTheme);
    revalidatePath(`/campaigns/${id}/sessions/${sessionId}/notes`);
    return res;
  }

  async function handleUpdateRsvp(status: RsvpStatus) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    const res = await upsertSessionAttendance(sessionId, currentUserId, status);
    revalidatePath(`/campaigns/${id}/sessions/${sessionId}/notes`);
    revalidatePath(`/campaigns/${id}/sessions/${sessionId}`);
    return res;
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        ...themeStyles,
        backgroundColor: theme.background,
        color: theme.ink,
      }}
    >
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <SessionTomeView
          campaignId={id}
          campaignTitle={campaign.title}
          currentUserId={userId}
          session={sessionData}

          attendances={attendancesData}
          notes={formattedNotes}
          initialTheme={initialGrimoireTheme}

          onSaveNote={handleSaveNote}
          onSaveTheme={handleSaveTheme}
        />
      </main>
    </div>
  );
}