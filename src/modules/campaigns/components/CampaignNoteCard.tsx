"use client";

import { useRef } from "react";
import { CampaignNoteForm, type CampaignNoteMember } from "@/modules/campaigns/components/CampaignNoteForm";

type CampaignNoteCardProps = {
  note: {
    id: string;
    authorId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    isShared: boolean;
    author: { id: string; name: string | null; nickname: string | null };
    shares: { userId: string }[];
  };
  members: CampaignNoteMember[];
  canManage: boolean;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

const displayName = (name: string | null, nickname: string | null) => nickname?.trim() || name?.trim() || "Anonyme";

export function CampaignNoteCard({ note, members, canManage, updateAction, deleteAction }: CampaignNoteCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openEditor = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closeEditor = () => {
    dialogRef.current?.close();
  };

  return (
    <article className="border border-[var(--theme-accent-soft)] bg-[var(--theme-surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--theme-accent)]">{note.isShared ? "Visible à la table" : "Privée avec partage sélectif"}</p>
          <h2 className="mt-2 font-[var(--font-heading)] text-xl text-[var(--theme-text)]">{note.title}</h2>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={openEditor} className="rounded border border-[var(--theme-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent-soft)]/30">
              Modifier
            </button>
            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (!window.confirm("Supprimer cette note ? Cette action est définitive.")) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="noteId" value={note.id} />
              <button type="submit" className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">
                Supprimer
              </button>
            </form>
          </div>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--theme-muted)]">{note.content}</p>
      {note.imageUrl && (
        <figure className="mt-4 overflow-hidden rounded border border-[var(--theme-accent-soft)] bg-black/5">
          <img src={note.imageUrl} alt={note.title} className="max-h-80 w-full object-cover" loading="lazy" />
        </figure>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--theme-muted)]">
        <p>par {displayName(note.author.name, note.author.nickname)}</p>
        {note.shares.length > 0 && (
          <p>
            {note.shares.length} joueur{note.shares.length > 1 ? "s" : ""} partagé{note.shares.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
      <dialog ref={dialogRef} className="w-[min(100%,44rem)] rounded-xl border border-[var(--theme-accent-soft)] bg-[var(--theme-background)] p-0 text-[var(--theme-text)] shadow-2xl backdrop:bg-black/40">
        <div className="max-h-[85vh] overflow-auto p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--theme-accent)]">Modifier la note</p>
              <h3 className="mt-2 font-[var(--font-heading)] text-2xl">{note.title}</h3>
            </div>
            <button type="button" onClick={closeEditor} className="rounded border border-[var(--theme-accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent-soft)]/30">
              Fermer
            </button>
          </div>
          <CampaignNoteForm
            action={updateAction}
            members={members}
            submitLabel="Enregistrer les modifications"
            noteId={note.id}
            onCancel={closeEditor}
            defaultValues={{
              title: note.title,
              content: note.content,
              imageUrl: note.imageUrl,
              isShared: note.isShared,
              sharedUserIds: note.shares.map((share) => share.userId),
            }}
          />
        </div>
      </dialog>
    </article>
  );
}
