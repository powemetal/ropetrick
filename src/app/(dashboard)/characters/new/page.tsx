import Link from "next/link";
import { redirect } from "next/navigation";
import { CharacterWizard, type CharacterWizardData } from "@/modules/characters/components/wizard/CharacterWizard";
import { createCharacter, getCharacterCreationCompendium } from "@/modules/characters/server/character-service";
import { getOrCreateCurrentUser, UnauthorizedError } from "@/modules/users/server/user-sync";

async function createCharacterAction(data: CharacterWizardData) {
  "use server";
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }

  const character = await createCharacter(user.id, data);
  redirect(`/characters/${character.id}`);
}

export default async function NewCharacterPage() {
  const compendium = await getCharacterCreationCompendium();
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-8 text-stone-900 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/characters" className="text-sm font-medium text-amber-700 hover:text-amber-900">
          ← Retour aux personnages
        </Link>
        <div className="mt-8">
          <CharacterWizard compendium={compendium} onSubmit={createCharacterAction} />
        </div>
      </div>
    </main>
  );
}
