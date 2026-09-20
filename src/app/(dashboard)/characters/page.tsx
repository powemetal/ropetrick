// @/app/characters/page.tsx
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
    <main
      className="mx-auto min-h-screen max-w-6xl space-y-10 px-6 py-12 transition-colors"
      style={{
        color: "var(--dnd-ink)",
        backgroundColor: "var(--dnd-background)",
      }}
    >
      {/* En-tête avec adaptation dynamique basée sur le thème global */}
      <header
        className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderColor: "var(--dnd-accent-soft)" }}
      >
        <div>
          <span
            className="inline-block text-xs font-extrabold uppercase tracking-[0.3em]"
            style={{ color: "var(--dnd-accent)" }}
          >
            {user.name ?? "Aventurier"}
          </span>
          <h1
            className="mt-1 text-4xl font-extrabold tracking-tight drop-shadow-sm"
            style={{ color: "var(--dnd-ink)" }}
          >
            Mes personnages
          </h1>
          <p
            className="mt-2 font-medium text-sm"
            style={{ color: "var(--dnd-muted)" }}
          >
            Vos fiches, vos aventures et vos notes de table en un seul endroit.
          </p>
        </div>

        {/* Groupe d'actions (Création + Import) */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/characters/new"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: "var(--dnd-ink)",
              color: "var(--dnd-background)",
            }}
          >
            Créer un personnage
          </Link>

          <ImportFoundryButton />
        </div>
      </header>

      {/* Section de la liste des personnages */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            style={{ color: "var(--dnd-ink)" }}
          >
            <span>Fiches</span> 
            <span
              className="inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-sm font-black border shadow-sm"
              style={{
                backgroundColor: "var(--dnd-surface)",
                borderColor: "var(--dnd-accent-soft)",
                color: "var(--dnd-accent)",
              }}
            >
              {characters.length}
            </span>
          </h2>
        </div>

        {characters.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-12 text-center shadow-inner"
            style={{
              borderColor: "var(--dnd-accent-soft)",
              backgroundColor: "var(--dnd-surface)",
            }}
          >
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--dnd-ink)" }}
            >
              Aucun personnage pour l'instant
            </h3>
            <p
              className="mt-2 text-sm max-w-md mx-auto"
              style={{ color: "var(--dnd-muted)" }}
            >
              Commencez par créer une fiche manuellement ou importez directement votre acteur Foundry VTT (.json).
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/characters/new"
                className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-bold shadow hover:opacity-90"
                style={{
                  backgroundColor: "var(--dnd-ink)",
                  color: "var(--dnd-background)",
                }}
              >
                Créer un personnage
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}