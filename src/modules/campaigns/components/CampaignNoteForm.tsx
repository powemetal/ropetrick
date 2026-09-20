"use client";

export type CampaignNoteMember = {
  id: string;
  name: string | null;
  nickname: string | null;
};

type CampaignNoteFormValues = {
  title: string;
  content: string;
  imageUrl: string | null;
  isShared: boolean;
  sharedUserIds: string[];
};

type CampaignNoteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  members: CampaignNoteMember[];
  submitLabel: string;
  noteId?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  defaultValues?: Partial<CampaignNoteFormValues>;
};

const defaults = {
  title: "",
  content: "",
  imageUrl: null,
  isShared: true,
  sharedUserIds: [],
};

const normalizeName = (name: string | null, nickname: string | null) => nickname?.trim() || name?.trim() || "Joueur";

export function CampaignNoteForm({ action, members, submitLabel, noteId, onCancel, cancelLabel = "Annuler", defaultValues }: CampaignNoteFormProps) {
  const values = { ...defaults, ...defaultValues };

  return (
    <form action={action} encType="multipart/form-data" className="space-y-4">
      {noteId && <input type="hidden" name="noteId" value={noteId} />}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--theme-accent)]">Titre</span>
          <input required name="title" defaultValue={values.title} placeholder="Titre de la note" className="rounded border border-[var(--theme-accent-soft)] bg-transparent px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--theme-accent)]">Visibilité</span>
          <select name="visibility" defaultValue={values.isShared ? "shared" : "private"} className="rounded border border-[var(--theme-accent-soft)] bg-transparent px-3 py-2">
            <option value="shared">Visible à la table</option>
            <option value="private">Privée au MJ</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-[var(--theme-accent)]">Contenu</span>
        <textarea required name="content" rows={7} defaultValue={values.content} placeholder="Rédigez votre note" className="rounded border border-[var(--theme-accent-soft)] bg-transparent px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--theme-accent)]">URL d'image</span>
          <input name="imageUrl" type="url" defaultValue={values.imageUrl ?? ""} placeholder="https://..." className="rounded border border-[var(--theme-accent-soft)] bg-transparent px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[var(--theme-accent)]">Téléverser une image</span>
          <input name="imageFile" type="file" accept="image/*" className="rounded border border-[var(--theme-accent-soft)] bg-transparent px-3 py-2" />
        </label>
      </div>
      <fieldset className="space-y-3 rounded border border-[var(--theme-accent-soft)] p-4">
        <legend className="px-1 text-sm font-medium text-[var(--theme-accent)]">Partage sélectif</legend>
        <p className="text-sm text-[var(--theme-muted)]">Cochez les joueurs qui doivent voir cette note si elle n’est pas visible à toute la table.</p>
        {members.length === 0 ? (
          <p className="text-sm text-[var(--theme-muted)]">Aucun joueur disponible dans cette campagne.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {members.map((member) => (
              <label key={member.id} className="flex items-center gap-3 rounded border border-[var(--theme-accent-soft)] px-3 py-2 text-sm">
                <input type="checkbox" name="sharedUserIds" value={member.id} defaultChecked={values.sharedUserIds.includes(member.id)} className="h-4 w-4 accent-[var(--theme-accent)]" />
                <span>{normalizeName(member.name, member.nickname)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded border border-[var(--theme-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent-soft)]/30">
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
}
