import Link from "next/link";
import { CharacterCard } from "@/modules/characters/components/CharacterCard";
import { getCharactersByUser } from "@/modules/characters/server/character-service";
import { redirect } from "next/navigation";
import { getOrCreateCurrentUser, UnauthorizedError } from "@/modules/users/server/user-sync";

export default async function CharactersPage() {
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  const characters = await getCharactersByUser(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-10 px-6 py-12">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Rope Trick</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-900">Mes personnages</h1>
          <p className="mt-2 text-stone-600">Vos fiches, vos aventures, vos notes de table.</p>
        </div>
        <Link href="/characters/new" className="inline-flex w-fit bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Créer un personnage
        </Link>
      </header>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-stone-900">Fiches ({characters.length})</h2>
        </div>
        {characters.length === 0 ? (
          <p className="mt-5 border border-stone-200 bg-white p-6 text-stone-600">Aucun personnage. Créez une fiche ou importez un acteur Foundry.</p>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
