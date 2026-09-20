import Link from "next/link";
import { CharacterCard } from "@/modules/characters/components/CharacterCard";
import { getCharactersByUser } from "@/modules/characters/server/character-service";
import { ImportFoundryButton } from "@/modules/characters/components/ImportFoundryButton";
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
    <main className="mx-auto min-h-screen max-w-6xl space-y-12 px-6 py-12">
      {/* En-tête modernisé */}
      <header className="flex flex-col gap-6 border-b border-stone-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
            Rope Trick
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900">
            Mes personnages
          </h1>
          <p className="mt-1 text-stone-600">
            Vos fiches, vos aventures et vos notes de table en un seul endroit.
          </p>
        </div>

        {/* Groupe d'actions (Création + Import) */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/characters/new"
            className="inline-flex items-center justify-center rounded-none bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
          >
            Créer un personnage
          </Link>

          <ImportFoundryButton />
        </div>
      </header>

      {/* Section de la liste des personnages */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            Fiches <span className="text-stone-400 font-normal text-lg">({characters.length})</span>
          </h2>
        </div>

        {characters.length === 0 ? (
          <div className="rounded-none border border-dashed border-stone-300 bg-white p-10 text-center">
            <h3 className="text-lg font-medium text-stone-900">Aucun personnage pour l'instant</h3>
            <p className="mt-1 text-sm text-stone-500">
              Commencez par créer une fiche manuellement ou importez directement votre acteur Foundry VTT (.json).
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/characters/new"
                className="inline-flex items-center rounded-none bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
              >
                Créer un personnage
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}