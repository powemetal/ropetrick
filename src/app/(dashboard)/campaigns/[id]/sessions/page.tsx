import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCampaignMemberRole, getCampaignDetails } from "@/modules/campaigns/server/campaign-service";
import { createSessionLog, getSessionLogs } from "@/modules/sessions/server/session-service";
import { SessionTomeView, type SessionNote } from "@/modules/campaigns/components/SessionTomeView";

type SessionsPageProps = { 
  params: Promise<{ id: string }> 
};

export default async function SessionsPage({ params }: SessionsPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  
  const { id } = await params;
  const role = await getCampaignMemberRole(id, userId);
  if (!role) redirect("/campaigns");

  const [campaign, sessions] = await Promise.all([
    getCampaignDetails(id, userId),
    getSessionLogs(id, userId),
  ]);

  const isDm = role === "DM" || role === "CO_DM";

  // Action serveur pour créer une nouvelle session ou note
  async function handleSaveNote(
    noteId: string | null,
    data: { title: string; content: string; isShared: boolean }
  ) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    // Enregistre la session via ton service existant
    await createSessionLog(id, currentUserId, {
      sessionNumber: (sessions.length || 0) + 1,
      title: data.title,
      playedAt: new Date(),
      summary: data.content,
      dmNotes: data.isShared ? null : data.content,
    });

    revalidatePath(`/campaigns/${id}/sessions`);
    return { ok: true, message: "Feuillet scellé !" };
  }

  // Transformation des logs de session existants en feuillets pour le grimoire
  const notes: SessionNote[] = sessions.map((s: any) => ({
    id: s.id,
    title: `Session #${s.sessionNumber} : ${s.title}`,
    content: isDm && s.dmNotes ? `${s.summary}\n\n--- Notes du MJ ---\n${s.dmNotes}` : s.summary,
    isShared: true,
    authorName: s.author?.name ?? "Maître du Jeu",
    createdAt: s.playedAt ? new Date(s.playedAt).toISOString() : undefined,
  }));

  // Session courante ou prochaine session planifiée
  const latestSession = sessions[0] ?? {
    id: "new",
    title: campaign.title,
    description: campaign.description,
    dateTime: new Date().toISOString(),
    location: "Table de jeu",
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8">
      <SessionTomeView
        campaignId={id}
        campaignTitle={campaign.title}
        currentUserId={userId}
        session={{
          id: latestSession.id,
          title: latestSession.title,
          description: latestSession.summary ?? campaign.description,
          dateTime: latestSession.playedAt
            ? new Date(latestSession.playedAt).toISOString()
            : new Date().toISOString(),
          location: "Tableau de bord de campagne",
        }}
        attendances={[]}
        notes={notes}
        onSaveNote={handleSaveNote}
      />
    </main>
  );
}