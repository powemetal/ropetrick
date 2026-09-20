import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CharacterNotebookView, type NotebookTheme } from "@/modules/characters/components/CharacterNotebookView";
import { CharacterSheet } from "@/modules/characters/components/CharacterSheet";
import { DeleteCharacterButton } from "@/modules/characters/components/DeleteCharacterButton";
import { deleteCharacter, fetchAvailableFeats, fetchAvailableLevelUpSpells, getCharacterById, getSkillDefinitions, levelUpCharacter, toggleCharacterInventoryEquipped, updateCharacter } from "@/modules/characters/server/character-service";
import type { CharacterLevelUpData, CharacterSheetUpdateData } from "@/modules/characters/components/CharacterSheet";
import { createNote, deleteNoteAction, updateNoteAction } from "@/modules/characters/server/notebook-service";
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
    await updateCharacter(currentUserId, id, data);
    revalidatePath(`/characters/${id}`);
  }

  // Action serveur pour persister le thème du carnet de notes
  async function updateNotebookThemeAction(newTheme: NotebookTheme) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return { ok: false, message: "Session expirée." };

    const existingCharacter = await getCharacterById(id, currentUserId);
    if (!existingCharacter) return { ok: false, message: "Personnage introuvable." };

    await updateCharacter(currentUserId, id, {
      name: existingCharacter.name,
      class: existingCharacter.class,
      subclass: existingCharacter.subclass,
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

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link href="/characters" className="text-sm font-medium text-amber-700 hover:text-amber-900">
        ← Retour aux personnages
      </Link>
      <header className="mt-8 flex flex-col gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-center">
        {character.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-900 text-4xl text-amber-200">{character.name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Fiche de personnage</p>
          <h1 className="mt-1 text-4xl font-semibold text-stone-900">{character.name}</h1>
          <p className="mt-2 text-stone-600">
            {character.race ?? "Race inconnue"} · {character.class ?? "Classe inconnue"} · {character.dndSubclass?.name ?? character.subclass ?? "Sous-classe inconnue"} · Niveau {character.level}
          </p>
        </div>
      </header>
      <div className="mt-5 flex justify-end">
        <DeleteCharacterButton action={deleteCharacterAction} />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["PV", hitPoints !== null ? `${hitPoints} / ${maxHitPoints ?? "-"}` : "-"],
          ["CA", armorClass ?? "-"],
          ["Vitesse", speed ?? "-"],
          ["Sous-classe", character.dndSubclass?.name ?? character.subclass ?? "-"],
        ].map(([label, value]) => (
          <div key={label} className="border border-stone-200 bg-white p-4">
            <dt className="text-sm text-stone-500">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-stone-900">{value}</dd>
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
    inventoryItems: character.inventoryItems,
    dndClass: character.dndClass,
    dndSubclass: character.dndSubclass,
    subclassId: character.subclassId,
    originFeat: character.background?.originFeat ?? null,
    feats: character.levelUpFeats,
    skillDefinitions,
    skillProficiencies: (character.skillProficiencies ?? {}) as Record<string, "NONE" | "PROFICIENT" | "EXPERTISE">,
  }}
  onSave={updateCharacterAction}
  onLevelUp={levelUpAction}
  onToggleEquip={toggleEquipAction}
/>
      </div>
      {character.campaignLinks.length > 0 && (
        <section className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="text-xl font-semibold text-stone-900">Campagnes</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {character.campaignLinks.map((link) => (
              <Link key={link.campaign.id} href={`/campaigns/${link.campaign.id}`} className="rounded border border-stone-300 px-3 py-2 text-sm text-stone-700">
                {link.campaign.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <CharacterNotebookView
        characterId={id}
        initialTheme={character.notebookTheme}
        notebooks={character.notebooks}
        createNoteAction={createNoteAction}
        updateNoteAction={updateNoteAction}
        deleteNoteAction={deleteNoteAction}
        onSaveTheme={updateNotebookThemeAction}
      />
    </main>
  );
}