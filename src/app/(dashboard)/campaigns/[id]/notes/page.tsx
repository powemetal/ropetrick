import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCampaignMemberRole } from "@/modules/campaigns/server/campaign-service";
import { createCampaignNote, getCampaignNotes } from "@/modules/campaigns/server/campaign-note-service";

const value = (formData: FormData, key: string) => {
  const item = formData.get(key);
  return typeof item === "string" ? item : "";
};

export default async function CampaignNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  const role = await getCampaignMemberRole(id, userId);
  if (!role) redirect("/campaigns");
  const notes = await getCampaignNotes(id, userId);
  async function createNoteAction(formData: FormData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");
    await createCampaignNote(id, currentUserId, {
      title: value(formData, "title"),
      content: value(formData, "content"),
      imageUrl: value(formData, "imageUrl") || null,
      isShared: value(formData, "visibility") === "shared",
      sharedUserIds: value(formData, "sharedUserIds")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    revalidatePath(`/campaigns/${id}/notes`);
  }
  const manager = role === "DM" || role === "CO_DM";
  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-12">
      <Link href={`/campaigns/${id}`} className="text-sm text-[var(--theme-accent)]">
        ← Retour à la campagne
      </Link>
      <header className="border-b border-[var(--theme-accent-soft)] pb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--theme-accent)]">Calepin de campagne</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-4xl">Notes partagées & secrètes</h1>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="border border-[var(--theme-accent-soft)] bg-[var(--theme-surface)] p-5">
            <p className="text-xs uppercase text-[var(--theme-accent)]">{note.isShared ? "Partagée" : "Secret du MJ"}</p>
            <h2 className="mt-2 font-[var(--font-heading)] text-xl">{note.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--theme-muted)]">{note.content}</p>
            {note.imageUrl && <img src={note.imageUrl} alt="" className="mt-4 max-h-64 w-full object-cover" />}
            <p className="mt-4 text-xs text-[var(--theme-muted)]">par {note.author.nickname}</p>
          </article>
        ))}
      </div>
      <section className="border-t border-[var(--theme-accent-soft)] pt-8">
        <h2 className="font-[var(--font-heading)] text-2xl">Nouvelle note</h2>
        <form action={createNoteAction} className="mt-4 grid gap-4 border border-[var(--theme-accent-soft)] bg-[var(--theme-surface)] p-5">
          <input required name="title" placeholder="Titre" className="rounded border bg-transparent px-3 py-2" />
          <textarea required name="content" rows={6} placeholder="Votre note" className="rounded border bg-transparent px-3 py-2" />
          <input name="imageUrl" type="url" placeholder="URL d'image S3/Blob (optionnel)" className="rounded border bg-transparent px-3 py-2" />
          <input name="sharedUserIds" placeholder="IDs joueurs à partager, séparés par des virgules" className="rounded border bg-transparent px-3 py-2" />
          <select name="visibility" className="rounded border bg-transparent px-3 py-2">
            <option value="shared">Partagée avec la table</option>
            {manager && <option value="secret">Privée pour le MJ</option>}
          </select>
          <button type="submit" className="w-fit rounded bg-[var(--theme-accent)] px-4 py-2 font-semibold text-white">
            Enregistrer
          </button>
        </form>
      </section>
    </main>
  );
}
