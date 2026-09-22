import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CharacterNotebookView, type NotebookTheme } from "@/modules/characters/components/CharacterNotebookView";
import { CharacterSheet } from "@/modules/characters/components/CharacterSheet";
import { DeleteCharacterButton } from "@/modules/characters/components/DeleteCharacterButton";
import { deleteCharacter, fetchAvailableFeats, fetchAvailableLevelUpSpells, getCharacterById, getSkillDefinitions, levelUpCharacter, toggleCharacterInventoryEquipped, updateCharacter, updateCharacterTheme, replaceCharacterAvatar } from "@/modules/characters/server/character-service";
import type { CharacterLevelUpData, CharacterSheetUpdateData } from "@/modules/characters/components/CharacterSheet";
import { createNote, deleteNoteAction, updateNoteAction } from "@/modules/characters/server/notebook-service";
import { uploadCharacterAvatar, getAvatarSignedUrl } from "@/lib/storage";
import { revalidatePath } from "next/cache";

type CharacterDetailPageProps = {
  params: Promise<{ id: string }>;
};

const getNumber = (value: unknown, ...keys: string[]) => {
  let current = value;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "number" ? current : null;
};

export default async function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  const character = await getCharacterById(id, userId);
  if (!character) notFound();

  // 1. Génération de l'URL signée temporaire pour l'avatar S3
  const avatarSignedUrl = await getAvatarSignedUrl(character.avatarUrl);

  const [skillDefinitions, availableFeats, availableSpells] = await Promise.all([getSkillDefinitions(), fetchAvailableFeats(), fetchAvailableLevelUpSpells()]);

  const hitPoints = getNumber(character.stats, "hitPoints", "current");
  const maxHitPoints = getNumber(character.stats, "hitPoints", "max");
  const armorClass = getNumber(character.stats, "armorClass");
  const speed = getNumber(character.stats, "speed", "walk");

  async function createNoteAction(previousState: { ok: boolean; message: string }, formData: FormData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return { ok: false, message: "Session expirée." };
    await createNote(currentUserId, { characterId: id, title: formData.get("title"), subject: formData.get("subject"), content: formData.get("content") });
    revalidatePath(`/characters/${id}`);
    return { ok: true, message: "Note enregistrée." };
  }

  async function updateCharacterAction(data: CharacterSheetUpdateData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    // Récupération du personnage actuel en BDD pour comparer / fusionner proprement
    const existingCharacter = await getCharacterById(id, currentUserId);
    if (!existingCharacter) return;

    const incomingFeats = (data as any).feats;

    if (data.themeKey && incomingFeats === undefined) {
      console.warn("[Character update] theme-only update detected in general save, preserving selectedFeats", {
        characterId: id,
        selectedFeatsCount: Array.isArray(existingCharacter.selectedFeats) ? existingCharacter.selectedFeats.length : 0,
      });
    }

    // On s'assure de ne injecter/écraser les feats que s'ils sont explicitement fournis sous forme de tableau valide
    const payload = {
      ...data,
      ...(Array.isArray(incomingFeats) ? { feats: incomingFeats } : {}),
    };

    await updateCharacter(currentUserId, id, payload);
    revalidatePath(`/characters/${id}`);
  }

  // Action dédiée et sécurisée pour le changement de thème de la feuille (évite d'effacer les dons)
  async function updateThemeAction(themeKey: string) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    await updateCharacterTheme(currentUserId, id, { themeKey });
    revalidatePath(`/characters/${id}`);
  }

  async function updateNotebookThemeAction(newTheme: NotebookTheme) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return { ok: false, message: "Session expirée." };

    const existingCharacter = await getCharacterById(id, currentUserId);
    if (!existingCharacter) return { ok: false, message: "Personnage introuvable." };

    await updateCharacter(currentUserId, id, {
      name: existingCharacter.name,
      class: existingCharacter.class ?? "",
      subclass: existingCharacter.subclass ?? "",
      strength: existingCharacter.strength,
      dexterity: existingCharacter.dexterity,
      constitution: existingCharacter.constitution,
      intelligence: existingCharacter.intelligence,
      wisdom: existingCharacter.wisdom,
      charisma: existingCharacter.charisma,
      skillProficiencies: (existingCharacter.skillProficiencies as any) ?? {},
      themeKey: existingCharacter.themeKey ?? "light",
      notebookTheme: newTheme,
    });

    revalidatePath(`/characters/${id}`);
    return { ok: true, message: "Reliure mise à jour." };
  }

  async function levelUpAction(data: CharacterLevelUpData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");
    await levelUpCharacter(currentUserId, id, data);
    revalidatePath(`/characters/${id}`);
  }

  async function toggleEquipAction(inventoryItemId: string) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");
    await toggleCharacterInventoryEquipped(currentUserId, id, inventoryItemId);
    revalidatePath(`/characters/${id}`);
  }

  async function deleteCharacterAction() {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");
    await deleteCharacter(id, currentUserId);
    redirect("/characters");
  }

  async function uploadAvatarAction(formData: FormData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    const file = formData.get("avatar") as File;
    if (!file || file.size === 0) return;

    // Upload vers le S3 Neon
    const newAvatarKey = await uploadCharacterAvatar(id, file);

    // Remplacement de l'avatar en BD (supprime l'ancien du stockage et enregistre la nouvelle clé)
    await replaceCharacterAvatar(id, currentUserId, newAvatarKey);

    revalidatePath(`/characters/${id}`);
  }

  return (
    <main
      className="mx-auto min-h-screen max-w-5xl px-6 py-12 transition-colors"
      style={{
        color: "var(--dnd-ink)",
        backgroundColor: "var(--dnd-background)",
      }}
    >
      <Link href="/characters" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: "var(--dnd-accent)" }}>
        <span>←</span> Retour aux personnages
      </Link>

      <header className="mt-8 flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--dnd-accent-soft)" }}>
        <div className="flex items-center gap-5">
          {/* Avatar et formulaire d'upload sécurisé sans événement client */}
          <form action={uploadAvatarAction} className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                {avatarSignedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSignedUrl} alt="" className="h-24 w-24 rounded-2xl object-cover shadow-lg border transition-opacity group-hover:opacity-75" style={{ borderColor: "var(--dnd-accent-soft)" }} />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black shadow-lg border transition-opacity group-hover:opacity-75"
                    style={{
                      backgroundColor: "var(--dnd-surface)",
                      color: "var(--dnd-accent)",
                      borderColor: "var(--dnd-accent-soft)",
                    }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">Choisir</div>
              </label>
              <input id="avatar-upload" name="avatar" type="file" accept="image/*" className="hidden" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--dnd-surface)",
                borderColor: "var(--dnd-accent-soft)",
                color: "var(--dnd-ink)",
              }}
            >
              Mettre à jour l'avatar
            </button>
          </form>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: "var(--dnd-accent)" }}>
              Fiche de personnage
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight drop-shadow-sm" style={{ color: "var(--dnd-ink)" }}>
              {character.name}
            </h1>
            <p className="mt-2 font-bold" style={{ color: "var(--dnd-ink)" }}>
              {character.race ?? "Race inconnue"} <span style={{ color: "var(--dnd-accent)" }}>·</span> {character.class ?? "Classe inconnue"} <span style={{ color: "var(--dnd-accent)" }}>·</span> {character.dndSubclass?.name ?? character.subclass ?? "Sous-classe inconnue"} <span style={{ color: "var(--dnd-accent)" }}>·</span> Niveau {character.level}
            </p>
          </div>
        </div>

        <div className="flex justify-end sm:justify-start">
          <DeleteCharacterButton action={deleteCharacterAction} />
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Points de vie", hitPoints !== null ? `${hitPoints} / ${maxHitPoints ?? "-"}` : "-"],
          ["Classe d'armure", armorClass ?? "-"],
          ["Vitesse", speed ?? "-"],
          ["Sous-classe", character.dndSubclass?.name ?? character.subclass ?? "-"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md"
            style={{
              borderColor: "var(--dnd-accent-soft)",
              background: "var(--dnd-surface)",
            }}
          >
            <dt className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dnd-muted)" }}>
              {label}
            </dt>
            <dd className="mt-1.5 text-xl font-extrabold truncate" style={{ color: "var(--dnd-ink)" }} title={String(value)}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <CharacterSheet
          characterId={id}
          character={{
            name: character.name,
            className: character.class,
            subclassName: character.dndSubclass?.name ?? character.subclass,
            level: character.level,
            abilityScores: {
              strength: character.strength,
              dexterity: character.dexterity,
              constitution: character.constitution,
              intelligence: character.intelligence,
              wisdom: character.wisdom,
              charisma: character.charisma,
            },
            currentHitPoints: character.currentHitPoints,
            maxHitPoints: character.maxHitPoints,
            temporaryHitPoints: character.temporaryHitPoints,
            armorClass: character.armorClass,
            initiative: character.initiative,
            speed: character.speed,
            hitDie: character.hitDie,
            themeKey: character.themeKey,
            copperPieces: character.copperPieces,
            silverPieces: character.silverPieces,
            electrumPieces: character.electrumPieces,
            goldPieces: character.goldPieces,
            platinumPieces: character.platinumPieces,
            personalityTraits: character.personalityTraits,
            ideals: character.ideals,
            bonds: character.bonds,
            flaws: character.flaws,
            appearance: character.appearance,
            backstory: character.backstory,
            alliesOrganizations: character.alliesOrganizations,
            spells: character.spells,
            inventoryItems: character.inventoryItems as any,
            dndClass: character.dndClass as any,
            dndSubclass: character.dndSubclass,
            subclassId: character.subclassId,
            originFeat: character.background?.originFeat ?? null as any,
            rawImportData: character.rawImportData ?? null,
            selectedFeats: (Array.isArray(character.selectedFeats) ? character.selectedFeats : []) as any[],
            levelUpFeats: (character.levelUpFeats ?? []) as any[],
            feats: [...(Array.isArray(character.selectedFeats) ? character.selectedFeats : []), ...(character.levelUpFeats ?? [])] as any,
            skillDefinitions,
            skillProficiencies: (character.skillProficiencies ?? {}) as Record<string, "NONE" | "PROFICIENT" | "EXPERTISE">,
          }}
          onSave={updateCharacterAction}
          onLevelUp={levelUpAction}
          onToggleEquip={toggleEquipAction}
          onUpdateTheme={updateThemeAction}
        />
      </div>

      {character.campaignLinks.length > 0 && (
        <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--dnd-ink)" }}>
            Campagnes associées
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {character.campaignLinks.map((link) => (
              <Link
                key={link.campaign.id}
                href={`/campaigns/${link.campaign.id}`}
                className="rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:opacity-80"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  background: "var(--dnd-surface)",
                  color: "var(--dnd-ink)",
                }}
              >
                {link.campaign.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <CharacterNotebookView characterId={id} initialTheme={character.notebookTheme} notebooks={character.notebooks} createNoteAction={createNoteAction} updateNoteAction={updateNoteAction} deleteNoteAction={deleteNoteAction} onSaveTheme={updateNotebookThemeAction} />
      </div>
    </main>
  );
}
